import { EveTradingCoClient } from "@/proto/etco.client";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";

const ENV_URL: string | undefined = process.env.NEXT_PUBLIC_GRPC_WEB_URL;
const GRPC_WEB_FORMAT: "binary" | "text" = "binary";

const newGrpcClient = (url: string): EveTradingCoClient =>
  new EveTradingCoClient(
    new GrpcWebFetchTransport({
      baseUrl: url,
      format: GRPC_WEB_FORMAT,
    })
  );

// Singleton wrapper around EveTradingCoClient

export class GrpcClientManager {
  private static grpcClient: EveTradingCoClient | null = null;

  private constructor() {}

  public static getClient(url?: string): EveTradingCoClient {
    if (GrpcClientManager.grpcClient === null) {
      if (url === undefined && ENV_URL === undefined) {
        throw new Error("url is undefinedd and ENV_URL is undefined");
      }
      GrpcClientManager.grpcClient = newGrpcClient(url ?? ENV_URL!);
    }
    return GrpcClientManager.grpcClient;
  }
}
