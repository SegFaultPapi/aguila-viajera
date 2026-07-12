import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("DocumentRegistry", function () {
  async function deployFixture() {
    const [owner, publicador, coordinadorWallet, otro] = await ethers.getSigners();
    const DocumentRegistry = await ethers.getContractFactory("DocumentRegistry");
    const registry = await DocumentRegistry.deploy(publicador.address);
    return { registry, owner, publicador, coordinadorWallet, otro };
  }

  const HASH_VERIFICACION = ethers.id("acta-ex-1001-copaco-iztapalapa") as `0x${string}`;
  const EXCURSION_ID = "ex-1001";
  const DESTINO = "Museo Nacional de Antropología";
  const COLONIA = "San Miguel Teotongo";
  const FECHA = Math.floor(Date.now() / 1000);
  const TOTAL_ASISTENTES = 18;
  const CUPO_MAXIMO = 25;
  const COORDINADOR_ID = "u-raul";

  async function publicarActaPrueba(registry: any, publicador: any) {
    return registry
      .connect(publicador)
      .publicarActa(
        EXCURSION_ID,
        DESTINO,
        COLONIA,
        FECHA,
        TOTAL_ASISTENTES,
        CUPO_MAXIMO,
        COORDINADOR_ID,
        HASH_VERIFICACION
      );
  }

  describe("Despliegue", function () {
    it("Inicia con 0 actas", async function () {
      const { registry } = await loadFixture(deployFixture);
      expect(await registry.totalActas()).to.equal(0);
    });

    it("Asigna owner y publicador correctamente", async function () {
      const { registry, owner, publicador } = await loadFixture(deployFixture);
      expect(await registry.owner()).to.equal(owner.address);
      expect(await registry.publicador()).to.equal(publicador.address);
    });

    it("Si se despliega con address(0), el deployer también es el publicador", async function () {
      const DocumentRegistry = await ethers.getContractFactory("DocumentRegistry");
      const [deployer] = await ethers.getSigners();
      const registry = await DocumentRegistry.deploy(ethers.ZeroAddress);
      expect(await registry.publicador()).to.equal(deployer.address);
    });
  });

  describe("publicarActa()", function () {
    it("Publica un acta y emite el evento ActaPublicada", async function () {
      const { registry, publicador } = await loadFixture(deployFixture);

      const tx = await publicarActaPrueba(registry, publicador);
      const receipt = await tx.wait();

      const evento = receipt?.logs.find(
        (log: any) => registry.interface.parseLog(log)?.name === "ActaPublicada"
      );
      expect(evento).to.not.be.undefined;
      expect(await registry.totalActas()).to.equal(1);
    });

    it("Guarda los datos agregados correctamente — sin nombres ni datos personales", async function () {
      const { registry, publicador } = await loadFixture(deployFixture);

      await publicarActaPrueba(registry, publicador);
      const actaId = await registry.listaActas(0);
      const acta = await registry.obtenerActa(actaId);

      expect(acta.excursionId).to.equal(EXCURSION_ID);
      expect(acta.destino).to.equal(DESTINO);
      expect(acta.colonia).to.equal(COLONIA);
      expect(acta.totalAsistentes).to.equal(TOTAL_ASISTENTES);
      expect(acta.cupoMaximo).to.equal(CUPO_MAXIMO);
      expect(acta.coordinadorId).to.equal(COORDINADOR_ID);
      expect(acta.hashVerificacion).to.equal(HASH_VERIFICACION);
      expect(acta.publicadoEn).to.be.greaterThan(0);
    });

    it("Revierte si quien llama no es el publicador (el coordinador no puede firmar)", async function () {
      const { registry, coordinadorWallet } = await loadFixture(deployFixture);
      await expect(
        registry
          .connect(coordinadorWallet)
          .publicarActa(
            EXCURSION_ID,
            DESTINO,
            COLONIA,
            FECHA,
            TOTAL_ASISTENTES,
            CUPO_MAXIMO,
            COORDINADOR_ID,
            HASH_VERIFICACION
          )
      ).to.be.revertedWithCustomError(registry, "NoAutorizado");
    });

    it("Revierte si excursionId está vacío", async function () {
      const { registry, publicador } = await loadFixture(deployFixture);
      await expect(
        registry
          .connect(publicador)
          .publicarActa("", DESTINO, COLONIA, FECHA, TOTAL_ASISTENTES, CUPO_MAXIMO, COORDINADOR_ID, HASH_VERIFICACION)
      ).to.be.revertedWithCustomError(registry, "ExcursionIdVacio");
    });

    it("Revierte si la misma excursión+fecha ya fue publicada", async function () {
      const { registry, publicador } = await loadFixture(deployFixture);
      await publicarActaPrueba(registry, publicador);
      await expect(publicarActaPrueba(registry, publicador)).to.be.revertedWithCustomError(
        registry,
        "ActaYaExiste"
      );
    });
  });

  describe("cambiarPublicador()", function () {
    it("El owner puede rotar la wallet publicadora", async function () {
      const { registry, owner, otro } = await loadFixture(deployFixture);
      await registry.connect(owner).cambiarPublicador(otro.address);
      expect(await registry.publicador()).to.equal(otro.address);
    });

    it("Revierte si quien llama no es el owner", async function () {
      const { registry, publicador, otro } = await loadFixture(deployFixture);
      await expect(
        registry.connect(publicador).cambiarPublicador(otro.address)
      ).to.be.revertedWithCustomError(registry, "NoAutorizado");
    });
  });

  describe("obtenerActas() — paginación", function () {
    it("Devuelve slice correcto con offset y límite", async function () {
      const { registry, publicador } = await loadFixture(deployFixture);

      for (let i = 0; i < 3; i++) {
        await registry
          .connect(publicador)
          .publicarActa(
            `ex-${i}`,
            DESTINO,
            COLONIA,
            FECHA + i,
            TOTAL_ASISTENTES,
            CUPO_MAXIMO,
            COORDINADOR_ID,
            HASH_VERIFICACION
          );
      }

      const pagina = await registry.obtenerActas(1, 2);
      expect(pagina.length).to.equal(2);
    });

    it("Devuelve array vacío si offset >= total", async function () {
      const { registry } = await loadFixture(deployFixture);
      const pagina = await registry.obtenerActas(10, 5);
      expect(pagina.length).to.equal(0);
    });
  });
});
