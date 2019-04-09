import _ from "lodash";
import React from "react";
import {
  Dashboard as DashboardIcon,
  ExitToApp as ExitToAppIcon,
  People as PeopleIcon,
  Person as PersonIcon
} from "@material-ui/icons";

export default ({ props }) => {
  const requireRoleMenuItem = requiredRole => menuItem => {
    const { role } = props;
    return role === requiredRole ? menuItem : null;
  };

  return _.chain([
    { icon: <DashboardIcon />, label: "Dashboard", link: "/dashboard" },
    requireRoleMenuItem("SUPER_ADMIN")({
      icon: <PeopleIcon />,
      label: "Users",
      link: "/users"
    }),
    {
      icon: <PersonIcon />,
      label: "My Profile",
      link: "/profile"
    },
    {
      icon: <ExitToAppIcon />,
      label: "Logout",
      link: "/signOut"
    }
  ])
    .compact()
    .value();
};
