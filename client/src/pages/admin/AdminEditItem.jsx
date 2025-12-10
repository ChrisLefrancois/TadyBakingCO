// src/pages/AdminItemEdit.jsx
import React from "react";
import AdminItemForm from "./AdminItemForm";
import { useParams } from "react-router-dom";

export default function AdminItemEdit() {
  const { id } = useParams();

  return <AdminItemForm mode="edit" id={id} />;
}
