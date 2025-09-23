"use client";

import {trpc} from "@/utils/trpc";
import {useQuery} from "@tanstack/react-query";

export default function TestPage() {
  const {data} = useQuery(trpc.testRouter.testing.queryOptions());
  return (
      <div>
        <h1>testing</h1>
        {data}
      </div>
  )
}
