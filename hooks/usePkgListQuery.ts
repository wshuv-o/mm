import { API } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";

export function usePkgListQuery() {
  const qk = ["packages"];
  const query = useQuery({
    queryKey: qk,
    queryFn: API.getPkgs, //rn paper counts page from 0
  });

  return query;
}
