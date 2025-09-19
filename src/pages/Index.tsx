import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/search", { replace: true });
  }, [navigate]);

  return null;
};

export default Index;
