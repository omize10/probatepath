"use client";

import { Render } from "@puckeditor/core";
import type { Data } from "@puckeditor/core";
import { puckConfig } from "./config";

export function PuckPage({ data }: { data: Data }) {
  return (
    <div className="space-y-16 pb-20 sm:space-y-20 sm:pb-24">
      <Render config={puckConfig} data={data} />
    </div>
  );
}
