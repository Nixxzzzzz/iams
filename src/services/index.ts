import { repositories } from "../repositories";
import { AssetService } from "./asset-service";

export const assetService = new AssetService(
  repositories.assetRepository,
  repositories.transactionRepository
);

export * from "./asset-service";
