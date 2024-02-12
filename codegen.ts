import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "schema.graphql",
  documents: ["src/**/*.ts", "!src/__generated__/**/*"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./src/__generated__/gql-validation/schemas.ts": {
      plugins: [
        "typescript",
        "typescript-validation-schema",
        {
          add: {
            content: `type JSONValueLevel1 = string | number | boolean; export type JSONValue = { [x: string]: JSONValueLevel1 } | JSONValueLevel1[] | JSONValueLevel1; `,
          },
        },
      ],
      config: {
        strictScalars: true,
        schema: "zod",
        enumsAsTypes: true,
        scalars: {
          date: "string",
          inet: "string",
          timestamptz: "string",
          timestamp: "string",
          oid: "string",
          uuid: "string",
          numeric: "number",
          bigint: "string",
          citext: "string",
          json: "JSONValue",
          jsonb: "JSONValue",
          bytea: "JSONValue",
        },
        scalarSchemas: {
          date: "z.string()",
          inet: "z.string()",
          timestamptz: "z.string()",
          timestamp: "z.string()",
          oid: "z.string()",
          uuid: "z.string()",
          numeric: "z.number()",
          bigint: "z.string()",
          citext: "z.string()",
          json: "z.string()",
          jsonb: "z.string()",
          bytea: "z.string()",
        },
      },
    },
    "./src/__generated__/gql/": {
      config: {
        enumsAsTypes: true,
        immutableTypes: true,
        useImplementingTypes: true,
        strictScalars: true,
        defaultScalarType: "unknown",
        scalars: {
          date: "string",
          inet: "string",
          timestamptz: "string",
          timestamp: "string",
          oid: "string",
          uuid: "string",
          numeric: "number",
          bigint: "string",
          citext: "string",
          json: "JSONValue",
          jsonb: "JSONValue",
          bytea: "JSONValue",
        },
      },
      preset: "client",
      presetConfig: {
        fragmentMasking: { unmaskFunctionName: "getFragmentData" },
      },
      plugins: [
        {
          add: {
            content:
              "type JSONValueLevel1 = string | number | boolean; export type JSONValue = { [x: string]: JSONValueLevel1 } | JSONValueLevel1[] | JSONValueLevel1; ",
          },
        },
      ],
    },
  },
};

export default config;
