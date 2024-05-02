import { RxGraphQLReplicationQueryBuilderResponse } from "node_modules/rxdb/dist/types/types";
import {
  RxCollection,
  RxCollectionCreator,
  RxDatabase,
  RxJsonSchema,
} from "rxdb";
import { replicateGraphQL } from "rxdb/plugins/replication-graphql";
import { hasuraURL } from "../hooks";

type DB = RxDatabase<{
  [key: string]: RxCollection;
}>;

type ExtractRxJsonSchemaType<T> = T extends RxJsonSchema<infer U> ? U : never;

type PushQueryBuilder = (
  db: DB,
  rows,
) => RxGraphQLReplicationQueryBuilderResponse;
type PullQueryBuilder = (
  db: DB,
  checkpoint: null | undefined,
  limit: number,
) => RxGraphQLReplicationQueryBuilderResponse;

type ReplicationBase = {
  accessToken: string | null;
  pullQueryBuilder: PullQueryBuilder;
  pushQueryBuilder?: PushQueryBuilder;
};

type ReplicationType = ReplicationBase & {
  collection: RxCollection;
  db: DB;
};

export function replication<TDocType>({
  accessToken,
  collection,
  db,
  pullQueryBuilder,
  pushQueryBuilder,
}: ReplicationType) {
  const replicationState = replicateGraphQL<TDocType, null>({
    collection,
    replicationIdentifier: collection.name,
    url: {
      http: hasuraURL,
    },
    pull: {
      queryBuilder: (checkpoint, limit) =>
        pullQueryBuilder(db, checkpoint, limit),

      responseModifier: (response) => ({
        checkpoint: null,
        documents: response,
      }),
    },
    ...(pushQueryBuilder && {
      push: {
        queryBuilder: (rows) => pushQueryBuilder(db, rows),
        responseModifier: () => [],
        batchSize: 10,
      },
    }),
    // headers which will be used in http requests against the server.
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    live: true,
    retryTime: 1000 * 5,
    autoStart: true,
  });

  replicationState.error$.subscribe((err) => {
    console.error("replication error for:", collection.name);
    console.log(err);
  });

  replicationState.awaitInitialReplication().then(() => {
    console.log("Initial replication done for", collection.name);
  });
}

export async function addCollections(
  db: DB,
  collections: ({ name: string } & RxCollectionCreator & ReplicationBase)[],
) {
  const collectionCreators = collections.reduce((acc, collection) => {
    acc[collection.name] = {
      schema: collection.schema,
      localDocuments: true,
    };
    return acc;
  }, {});

  await db.addCollections(collectionCreators);

  collections.forEach((collection) => {
    replication<ExtractRxJsonSchemaType<typeof collection.schema>>({
      accessToken: collection.accessToken,
      collection: db[collection.name] as RxCollection,
      db,
      pullQueryBuilder: collection.pullQueryBuilder,
      pushQueryBuilder: collection.pushQueryBuilder,
    });
  });
}
