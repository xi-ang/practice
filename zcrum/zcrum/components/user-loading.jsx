"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import React from "react";
import { BarLoader } from "react-spinners";

const UserLoading = () => {
  const { isLoaded } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();

  if (!isLoaded || !isUserLoaded) {
    // BarLoader用于在页面加载时显示一个条形的加载动画。
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  } else <></>;
};

export default UserLoading;
