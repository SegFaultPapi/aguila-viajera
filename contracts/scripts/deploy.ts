import { ethers, network } from "hardhat";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * Script de deploy del contrato DocumentRegistry.
 *
 * Uso:
 *   npm run deploy:local    → Hardhat node local
 *   npm run deploy:sepolia  → Sepolia testnet (requiere ETH de faucet)
 *   npm run deploy:mainnet  → Ethereum mainnet (requiere ETH real + aprobación del equipo)
 *
 * Después del deploy, guarda la dirección en deployments/<network>.json
 * para que el frontend la consuma desde lib/blockchain/config.ts.
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  // La wallet publicadora es la única autorizada a llamar publicarActa().
  // Vive en el backend (COPACO_PUBLICADOR_PRIVATE_KEY en .env del proyecto Next.js),
  // nunca en el dispositivo del coordinador. Por defecto, en este deploy usamos
  // el mismo deployer como publicador; en producción se recomienda usar una
  // dirección distinta derivada de esa clave de servidor.
  const publicadorAddress = process.env.COPACO_PUBLICADOR_ADDRESS || ethers.ZeroAddress;

  console.log("─────────────────────────────────────────────");
  console.log("  Águila Viajera — Deploy DocumentRegistry");
  console.log("─────────────────────────────────────────────");
  console.log(`  Red:         ${network.name}`);
  console.log(`  Deployer:    ${deployer.address}`);
  console.log(
    `  Publicador:  ${publicadorAddress === ethers.ZeroAddress ? `${deployer.address} (= deployer)` : publicadorAddress}`
  );
  console.log(
    `  Balance:     ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`
  );
  console.log("─────────────────────────────────────────────");

  const DocumentRegistry = await ethers.getContractFactory("DocumentRegistry");
  console.log("\nDesplegando DocumentRegistry...");

  const registry = await DocumentRegistry.deploy(publicadorAddress);
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  const deployTx = registry.deploymentTransaction();

  console.log(`\n✅ DocumentRegistry desplegado en: ${address}`);
  if (deployTx?.hash) {
    console.log(`   TX Hash: ${deployTx.hash}`);
  }

  // Guardar la dirección del contrato para el frontend
  const deploymentsDir = join(__dirname, "../deployments");
  mkdirSync(deploymentsDir, { recursive: true });

  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    address,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    txHash: deployTx?.hash ?? null,
  };

  const outputPath = join(deploymentsDir, `${network.name}.json`);
  writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n   Dirección guardada en: deployments/${network.name}.json`);

  // Instrucciones para verificar en Etherscan
  if (network.name !== "localhost") {
    console.log("\n─────────────────────────────────────────────");
    console.log("  Siguiente paso: verificar en Etherscan");
    console.log(`  npx hardhat verify --network ${network.name} ${address}`);
    console.log("─────────────────────────────────────────────");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
