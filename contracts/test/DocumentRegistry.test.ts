import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("DocumentRegistry", function () {
  async function deployFixture() {
    const [owner, coordinador, otro] = await ethers.getSigners();
    const DocumentRegistry = await ethers.getContractFactory("DocumentRegistry");
    const registry = await DocumentRegistry.deploy();
    return { registry, owner, coordinador, otro };
  }

  // SHA-256 de '{"test":"valor"}' como bytes32 para pruebas
  const HASH_PRUEBA = ethers.id("excursion-test-copaco-iztapalapa") as `0x${string}`;
  const TIPO = "excursion";
  const REF_ID = "ex-1001";

  describe("Despliegue", function () {
    it("Inicia con 0 registros", async function () {
      const { registry } = await loadFixture(deployFixture);
      expect(await registry.totalRegistros()).to.equal(0);
    });
  });

  describe("anclar()", function () {
    it("Ancla un registro y emite el evento RegistroAnclado", async function () {
      const { registry, coordinador } = await loadFixture(deployFixture);

      const tx = await registry.connect(coordinador).anclar(HASH_PRUEBA, TIPO, REF_ID);
      const receipt = await tx.wait();

      // Verificar que el evento se emitió
      const evento = receipt?.logs.find(
        (log) => registry.interface.parseLog(log)?.name === "RegistroAnclado"
      );
      expect(evento).to.not.be.undefined;

      // Total de registros incrementó
      expect(await registry.totalRegistros()).to.equal(1);
    });

    it("Guarda autor, hash y tipo correctamente", async function () {
      const { registry, coordinador } = await loadFixture(deployFixture);

      const tx = await registry.connect(coordinador).anclar(HASH_PRUEBA, TIPO, REF_ID);
      await tx.wait();

      const registroId = (await registry.listaRegistros(0)) as `0x${string}`;
      const registro = await registry.obtenerRegistro(registroId);

      expect(registro.contenidoHash).to.equal(HASH_PRUEBA);
      expect(registro.autor).to.equal(coordinador.address);
      expect(registro.tipo).to.equal(TIPO);
      expect(registro.referenciaId).to.equal(REF_ID);
      expect(registro.timestamp).to.be.greaterThan(0);
    });

    it("Revierte si el hash es cero", async function () {
      const { registry, coordinador } = await loadFixture(deployFixture);
      await expect(
        registry.connect(coordinador).anclar(ethers.ZeroHash, TIPO, REF_ID)
      ).to.be.revertedWithCustomError(registry, "HashVacio");
    });

    it("Revierte si tipo está vacío", async function () {
      const { registry, coordinador } = await loadFixture(deployFixture);
      await expect(
        registry.connect(coordinador).anclar(HASH_PRUEBA, "", REF_ID)
      ).to.be.revertedWithCustomError(registry, "TipoVacio");
    });

    it("Revierte si referenciaId está vacío", async function () {
      const { registry, coordinador } = await loadFixture(deployFixture);
      await expect(
        registry.connect(coordinador).anclar(HASH_PRUEBA, TIPO, "")
      ).to.be.revertedWithCustomError(registry, "ReferenciaVacia");
    });
  });

  describe("verificar()", function () {
    it("Devuelve integro=true cuando el hash coincide", async function () {
      const { registry, coordinador } = await loadFixture(deployFixture);

      await registry.connect(coordinador).anclar(HASH_PRUEBA, TIPO, REF_ID);
      const registroId = await registry.listaRegistros(0);

      const [integro, autor] = await registry.verificar(registroId, HASH_PRUEBA);
      expect(integro).to.be.true;
      expect(autor).to.equal(coordinador.address);
    });

    it("Devuelve integro=false cuando el hash NO coincide (detección de alteración)", async function () {
      const { registry, coordinador } = await loadFixture(deployFixture);

      await registry.connect(coordinador).anclar(HASH_PRUEBA, TIPO, REF_ID);
      const registroId = await registry.listaRegistros(0);

      const hashAlterado = ethers.id("contenido-modificado-despues");
      const [integro] = await registry.verificar(registroId, hashAlterado);
      expect(integro).to.be.false;
    });
  });

  describe("obtenerRegistros() — paginación", function () {
    it("Devuelve slice correcto con offset y límite", async function () {
      const { registry, coordinador } = await loadFixture(deployFixture);

      // Anclar 3 registros
      for (let i = 0; i < 3; i++) {
        const hash = ethers.id(`excursion-${i}`) as `0x${string}`;
        await registry.connect(coordinador).anclar(hash, TIPO, `ex-${i}`);
      }

      const pagina = await registry.obtenerRegistros(1, 2);
      expect(pagina.length).to.equal(2);
    });

    it("Devuelve array vacío si offset >= total", async function () {
      const { registry } = await loadFixture(deployFixture);
      const pagina = await registry.obtenerRegistros(10, 5);
      expect(pagina.length).to.equal(0);
    });
  });
});
