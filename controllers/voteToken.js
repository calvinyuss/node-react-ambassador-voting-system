const _ = require("lodash");
const moment = require("moment");
const crypto = require("crypto");
const db = require("../models");
const Socket = require("../services/socket");
const canvas = require("../modules/canvas");
const { sendMail } = require('../services/mailer/mailgun')
const { SHA3 } = require("sha3");

function hash(value) {
  const instance = new SHA3(512);
  instance.update(value);
  return instance.digest("hex");
}

function encapsulateVoteToken(voteToken, user) {
  if (user.role === "SUPER_ADMIN") return voteToken;
  else
    return {
      ...voteToken.toObject()
    };
}

async function newCaptcha(myOwnUniqueId) {
  return new db.Captcha({
    myOwnUniqueId,
    value: (await crypto.randomBytes(2))
      .toString("hex")
      .toUpperCase()
      .replace(/0/g, "Y")
      .replace(/O/g, "Z")
  });
}

async function renewCaptcha(captcha) {
  captcha.value = (await crypto.randomBytes(2))
    .toString("hex")
    .toUpperCase()
    .replace(/0/g, "Y")
    .replace(/O/g, "Z");
  return captcha;
}

exports.createVoteTokens = async (req, res) => {
  let currentStep = 0;
  const { socketId, voteTokenCount: _voteTokenCount } = req.body;
  const voteTokenCount = Number(_voteTokenCount);

  function emitProgress(msg) {
    currentStep += 1;
    if (!Socket.identifiedSockets[socketId]) return;
    Socket.identifiedSockets[socketId].emit("progress", {
      msg,
      currentStep,
      totalStep: voteTokenCount
    });
  }

  const voteTokens = [];
  for (let i = 0; i < voteTokenCount; i++) {
    try {
      emitProgress();
      let value = null;
      do {
        value = (await crypto.randomBytes(3))
          .toString("hex")
          .toUpperCase()
          .replace(/0/g, "Y")
          .replace(/O/g, "Z");
      } while (!isNaN(Number(value)));
      const voteToken = new db.VoteToken({
        valueHash: hash(value)
      });
      await voteToken.save();
      voteTokens.push({ value });
      Socket.globalSocket.emit("VOTE_TOKEN_GET_BY_ID", { id: voteToken._id });
    } catch (error) {
      console.log({ error });
    }
  }
  res.json(voteTokens);
};

exports.getVoteTokens = async (req, res) => {
  try {
    const voteTokens = await db.VoteToken.find({});
    const minifiedVoteTokens = _.chain(voteTokens)
      .map(vt => encapsulateVoteToken(vt, req.user))
      .value();
    res.json(minifiedVoteTokens);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.getVoteTokenById = async (req, res) => {
  const { voteTokenId } = req.params;
  try {
    const voteToken = await db.VoteToken.findById(voteTokenId);
    res.json(encapsulateVoteToken(voteToken, req.user));
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.getVoteTokenByValue = async (req, res) => {
  const { voteTokenValue } = req.params;
  try {
    const voteToken = await db.VoteToken.findOne({
      valueHash: hash(voteTokenValue.toUpperCase())
    });
    if (!voteToken) {
      return res.status(422).json({ error: { msg: "Token doesn't exist!" } });
    }
    res.json(encapsulateVoteToken(voteToken, req.user));
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.replaceVoteTokenById = async (req, res) => {
  const { voteTokenId } = req.params;
  try {
    const voteToken = await db.VoteToken.findById(voteTokenId);
    const value = (await crypto.randomBytes(3))
      .toString("hex")
      .toUpperCase()
      .replace(/0/g, "Y")
      .replace(/O/g, "Z");
    voteToken.valueHash = hash(value);
    voteToken.usedAt = null;
    voteToken.candidateId = null;
    await voteToken.save();
    res.json({ value });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.getVoteTokenCaptchaImageByIp = async (req, res) => {
  const { myOwnUniqueId } = req.query;
  console.log("get capthca", myOwnUniqueId);
  try {
    let captcha = await db.Captcha.findOne({
      myOwnUniqueId
    });
    if (!captcha) {
      captcha = await newCaptcha(myOwnUniqueId);
      await captcha.save();
    }
    canvas.generateCaptchaImagePngStream(captcha).pipe(res);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.updateVoteTokenByValue = async (req, res) => {
  const { tokenValue, candidateId, captchaValue } = req.body;
  const { myOwnUniqueId } = req.body;
  console.log("update capthca", myOwnUniqueId);

  let voteTokenSession = null,
    captchaSession = null;
  try {
    voteTokenSession = await db.VoteToken.startSession();
    voteTokenSession.startTransaction();
    captchaSession = await db.Captcha.startSession();
    captchaSession.startTransaction();

    const configuration = await db.Configuration.findOne({});
    if (!configuration.onAir) {
      return res.status(422).json({
        error: { msg: "The voting is currently closed!" }
      });
    } else {
      const currentTime = moment().valueOf();
      if (currentTime < moment(configuration.openTimestamp).valueOf()) {
        return res.status(422).json({
          error: { msg: "The voting is still closed!" }
        });
      } else if (currentTime > moment(configuration.closeTimestamp).valueOf()) {
        return res.status(422).json({
          error: { msg: "The voting is already over!" }
        });
      }
    }

    let captcha = await db.Captcha.findOne({ myOwnUniqueId });

    if (!captcha) {
      console.log("tidak ada captcha!");
      captcha = await newCaptcha(myOwnUniqueId);
      await captcha.save();
      await captchaSession.commitTransaction();
      return res.status(422).json({
        error: { msg: "Captcha is wrong! Please type again." }
      });
    } else if (captcha.value !== captchaValue.toUpperCase()) {
      console.log(captcha.value, captchaValue.toUpperCase());
      console.log("captcha mismatch!");
      captcha = await renewCaptcha(captcha);
      await captcha.save();
      await captchaSession.commitTransaction();
      return res.status(422).json({
        error: { msg: "Captcha is wrong! Please retype." }
      });
    }

    const voteToken = await db.VoteToken.findOne({
      valueHash: hash(tokenValue.toUpperCase())
    });
    if (!voteToken) {
      console.log("tidak ada voteToken!");
      captcha = await renewCaptcha(captcha);
      await captcha.save();
      await captchaSession.commitTransaction();
      return res.status(422).json({ error: { msg: "Token doesn't exist!" } });
    } else if (voteToken.candidateId) {
      console.log("voteToken sudah dipake!");
      return res.status(422).json({ error: { msg: "Token has been used!" } });
    }

    const candidate = await db.Candidate.findById(candidateId);
    if (!candidate) {
      console.log("tidak ada candidate!");
      captcha = await renewCaptcha(captcha);
      await captcha.save();
      await captchaSession.commitTransaction();
      return res
        .status(422)
        .json({ error: { msg: "Candidate doesn't exist!" } });
    }

    console.log("semua aman");
    await captcha.remove();
    voteToken.candidateId = candidateId;
    voteToken.usedAt = moment().toDate();
    await voteToken.save();

    await voteTokenSession.commitTransaction();
    await captchaSession.commitTransaction();

    res.json({ success: true });
    Socket.globalSocket.emit("VOTE_TOKEN_GET_BY_ID", { id: voteToken._id });
  } catch (error) {
    console.log({ error });
    if (voteTokenSession) await voteTokenSession.abortTransaction();
    if (captchaSession) await captchaSession.abortTransaction();
    res.status(500).json({ error: { msg: "Please try again!" } });
  } finally {
    if (voteTokenSession) voteTokenSession.endSession();
    if (captchaSession) await captchaSession.endSession();
  }
};

exports.deleteVoteTokenById = async (req, res) => {
  const { voteTokenId } = req.params;
  try {
    const voteToken = await db.VoteToken.findByIdAndRemove(voteTokenId);
    res.json({ id: voteToken._id });
    Socket.globalSocket.emit("VOTE_TOKEN_REMOVE_BY_ID", { id: voteToken._id });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

// register peserta yang akan vote 
// request yang diperlukan adalah data input seperti nama, email, nomor telp
// email dan nomor telp harus unique untuk menghindari fake vote
// setelah register akan dikirimkan email verification ke email request
/**
request 
  name|string
  email|email
  no|string
url query -> candidateId -> mongoose unique id untuk kandidat 

return response json
*/
exports.registerToken = async (req, res) => {
  const { tokenValue, candidateId, captchaValue, participantData } = req.body;
  const { myOwnUniqueId } = req.body;
  console.log("update capthca", myOwnUniqueId);

  let voteTokenSession = null,
    captchaSession = null;
  try {
    voteTokenSession = await db.VoteToken.startSession();
    voteTokenSession.startTransaction();
    captchaSession = await db.Captcha.startSession();
    captchaSession.startTransaction();


    //check if voting is close or not
    const configuration = await db.Configuration.findOne({});
    if (!configuration.onAir) {
      return res.status(422).json({
        error: { msg: "The voting is currently closed!" }
      });
    } else {
      const currentTime = moment().valueOf();
      if (currentTime < moment(configuration.openTimestamp).valueOf()) {
        return res.status(422).json({
          error: { msg: "The voting is still closed!" }
        });
      } else if (currentTime > moment(configuration.closeTimestamp).valueOf()) {
        return res.status(422).json({
          error: { msg: "The voting is already over!" }
        });
      }
    }

    // verify captcha 
    let captcha = await db.Captcha.findOne({ myOwnUniqueId });

    if (!captcha) {
      console.log("tidak ada captcha!");
      captcha = await newCaptcha(myOwnUniqueId);
      await captcha.save();
      await captchaSession.commitTransaction();
      return res.status(422).json({
        error: { msg: "Captcha is wrong! Please type again." }
      });
    } else if (captcha.value !== captchaValue.toUpperCase()) {
      console.log(captcha.value, captchaValue.toUpperCase());
      console.log("captcha mismatch!");
      captcha = await renewCaptcha(captcha);
      await captcha.save();
      await captchaSession.commitTransaction();
      return res.status(422).json({
        error: { msg: "Captcha is wrong! Please retype." }
      });
    }

    // const voteToken = await db.VoteToken.findOne({
    //   valueHash: hash(tokenValue.toUpperCase())
    // });
    // if (!voteToken) {
    //   console.log("tidak ada voteToken!");
    //   captcha = await renewCaptcha(captcha);
    //   await captcha.save();
    //   await captchaSession.commitTransaction();
    //   return res.status(422).json({ error: { msg: "Token doesn't exist!" } });
    // } else if (voteToken.candidateId) {
    //   console.log("voteToken sudah dipake!");
    //   return res.status(422).json({ error: { msg: "Token has been used!" } });
    // }

    // verify candidate 
    const candidate = await db.Candidate.findById(candidateId);
    if (!candidate) {
      console.log("tidak ada candidate!");
      captcha = await renewCaptcha(captcha);
      await captcha.save();
      await captchaSession.commitTransaction();
      return res
        .status(422)
        .json({ error: { msg: "Candidate doesn't exist!" } });
    }

    //verify participant data 
    const participant = await db.VoteToken.findOne({ $or: [ {'participant.email' : participantData.email }, {'participant.no' : participantData.no } ] });
    if ( participant ){
      console.log(participant)
      console.log("email dan no telp sudah terdaftar");
      await captcha.save();
      await captchaSession.commitTransaction();
      return res
        .status(422)
        .json({ error: { msg: "Email dan nomor telp sudah terdaftar" } });
    }

    // create vote token
    let value = null;
    do {
      value = (await crypto.randomBytes(3))
        .toString("hex")
        .toUpperCase()
        .replace(/0/g, "Y")
        .replace(/O/g, "Z");
    } while (!isNaN(Number(value)));
    const voteToken = new db.VoteToken({
      valueHash: hash(value),
      participant: participantData,
      candidateId: candidateId,
    });

    await sendMail(voteToken.participant.email,{
      fullname : candidate.fullname,
      img : candidate.image.secureUrl,
    }, `${req.get('host')}/verify/${voteToken._id}`)
    
    console.log("semua aman");
    await captcha.remove();
    await voteToken.save();
    
    await voteTokenSession.commitTransaction();
    await captchaSession.commitTransaction();

    console.log(voteToken);

    res.json({ success: true });
    Socket.globalSocket.emit("VOTE_TOKEN_GET_BY_ID", { id: voteToken._id });
  } catch (error) {
    console.log({ error });
    if (voteTokenSession) await voteTokenSession.abortTransaction();
    if (captchaSession) await captchaSession.abortTransaction();
    res.status(500).json({ error: { msg: "Please try again!" } });
  } finally {
    if (voteTokenSession) voteTokenSession.endSession();
    if (captchaSession) await captchaSession.endSession();
  }
}

/**
Verify token yang sudah di register.
url query -> candidateId -> mongoose unique id untuk kandidat 
*/
exports.verifyToken = async (req, res) => {
  voteTokenSession = await db.VoteToken.startSession();
  voteTokenSession.startTransaction();
  
  const { voteTokenId } = req.params;

  try{

    //check if voting is close or not
    const configuration = await db.Configuration.findOne({});
    if (!configuration.onAir) {
      return res.status(422).json({
        error: { msg: "The voting is currently closed!" }
      });
    } else {
      const currentTime = moment().valueOf();
      if (currentTime < moment(configuration.openTimestamp).valueOf()) {
        return res.status(422).json({
          error: { msg: "The voting is still closed!" }
        });
      } else if (currentTime > moment(configuration.closeTimestamp).valueOf()) {
        return res.status(422).json({
          error: { msg: "The voting is already over!" }
        });
      }
    }
    
    voteToken = await db.VoteToken.findById(voteTokenId);
  
    if(!voteToken) {
      console.log("Vote token not found")
      return res
        .status(422)
        .json({ error: { msg: "Vote token not found" } });
    }else if(voteToken.usedAt){
      console.log("Your email already verified")
      if (voteTokenSession) voteTokenSession.endSession();
      return res.json({ success: true });
    }

    voteToken.usedAt = moment().toDate();
    
    await voteToken.save();

    await voteTokenSession.commitTransaction();

    res.json({ success: true });
    Socket.globalSocket.emit("VOTE_TOKEN_GET_BY_ID", { id: voteToken._id });

  } catch (error) {
    console.log({ error });
    if (voteTokenSession) await voteTokenSession.abortTransaction();
    res.status(500).json({ error: { msg: "Please try again!" } });
  } finally {
    if (voteTokenSession) voteTokenSession.endSession();
  }
}
