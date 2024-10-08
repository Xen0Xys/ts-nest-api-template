import {Test, TestingModule} from "@nestjs/testing";
import {CipherService} from "./cipher.service";
import * as dotenv from "dotenv";
import {AssertionError} from "node:assert";
import * as crypto from "crypto";

dotenv.config({path: ".env.ci"});

describe("EncryptionService", () => {
    let service: CipherService;

    beforeEach(async() => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CipherService],
        }).compile();

        service = module.get<CipherService>(CipherService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    const content = "test";
    describe("SHA-256 tests", () => {
        it("Get SHA-256 sum", () => {
            const sum = service.getSum(content);
            expect(sum).toBe("9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");
        });
        it("Get SHA-256 sum with empty content", () => {
            const sum = service.getSum("");
            expect(sum).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        });
        it("Get SHA-256 sum with null content", () => {
            const sum = service.getSum(null);
            expect(sum).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        });
        it("Get SHA-256 sum with undefined content", () => {
            const sum = service.getSum(undefined);
            expect(sum).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        });
    });

    const hashCost = 2;
    describe("Hash tests", () => {
        it("Hash password", async() => {
            const hash = await service.hashPassword(content, hashCost);
            expect(typeof hash).toBe("string");
            const compare = await service.comparePassword(hash, content);
            expect(compare).toBe(true);
        });
        it("Compare password with wrong content", async() => {
            const hash = await service.hashPassword(content, hashCost);
            const compare = await service.comparePassword(hash, "wrong_content");
            expect(compare).toBe(false);
        });
        it("Hash password with negative cost", async() => {
            await expect(service.hashPassword(content, -1)).rejects.toThrow(AssertionError);
        });
        it("Hash password with empty content", async() => {
            const hash = await service.hashPassword("", hashCost);
            expect(typeof hash).toBe("string");
            const compare = await service.comparePassword(hash, "");
            expect(compare).toBe(true);
        });
        it("Hash password with null content", async() => {
            const hash = await service.hashPassword(null, hashCost);
            expect(typeof hash).toBe("string");
            const compare = await service.comparePassword(hash, null);
            expect(compare).toBe(true);
        });
        it("Hash password with undefined content", async() => {
            const hash = await service.hashPassword(undefined, hashCost);
            expect(typeof hash).toBe("string");
            const compare = await service.comparePassword(hash, undefined);
            expect(compare).toBe(true);
        });
    });

    describe("Symmetric cipher tests", () => {
        it("Cipher content", () => {
            const encrypted = service.cipherSymmetric(content, process.env.SYMMETRIC_ENCRYPTION_KEY);
            expect(typeof encrypted).toBe("string");
            const decrypted = service.decipherSymmetric(encrypted, process.env.SYMMETRIC_ENCRYPTION_KEY);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(content.length);
            expect(decrypted).toBe(content);
        });
        it("Decipher symmetric with wrong key", () => {
            const encrypted = service.cipherSymmetric(content, process.env.SYMMETRIC_ENCRYPTION_KEY);
            expect(() => service.decipherSymmetric(encrypted, "wrong_key")).toThrow(Error);
        });
        it("Cipher content with empty content", () => {
            const encrypted = service.cipherSymmetric("", process.env.SYMMETRIC_ENCRYPTION_KEY);
            expect(typeof encrypted).toBe("string");
            expect(encrypted.length).toBe(56);
            const decrypted = service.decipherSymmetric(encrypted, process.env.SYMMETRIC_ENCRYPTION_KEY);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(0);
            expect(decrypted).toBe("");
        });
        it("Cipher content with null content", () => {
            const encrypted = service.cipherSymmetric(null, process.env.SYMMETRIC_ENCRYPTION_KEY);
            expect(typeof encrypted).toBe("string");
            expect(encrypted.length).toBe(56);
            const decrypted = service.decipherSymmetric(encrypted, process.env.SYMMETRIC_ENCRYPTION_KEY);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(0);
            expect(decrypted).toBe("");
        });
        it("Cipher content with undefined content", () => {
            const encrypted = service.cipherSymmetric(undefined, process.env.SYMMETRIC_ENCRYPTION_KEY);
            expect(typeof encrypted).toBe("string");
            expect(encrypted.length).toBe(56);
            const decrypted = service.decipherSymmetric(encrypted, process.env.SYMMETRIC_ENCRYPTION_KEY);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(0);
            expect(decrypted).toBe("");
        });
    });

    const TIME_COST = 10000;
    describe("Symmetric hard cipher tests", () => {
        it("Hard cipher content", () => {
            const encrypted = service.cipherHardSymmetric(content, process.env.SYMMETRIC_ENCRYPTION_KEY, TIME_COST);
            expect(typeof encrypted).toBe("string");
            const decrypted = service.decipherHardSymmetric(encrypted, process.env.SYMMETRIC_ENCRYPTION_KEY, TIME_COST);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(content.length);
            expect(decrypted).toBe(content);
        });
        it("Hard decipher symmetric with wrong key", () => {
            const encrypted = service.cipherHardSymmetric(content, process.env.SYMMETRIC_ENCRYPTION_KEY, TIME_COST);
            expect(() => service.decipherHardSymmetric(encrypted, "wrong_key")).toThrow(Error);
        });
        it("Hard cipher content with empty content", () => {
            const encrypted = service.cipherHardSymmetric("", process.env.SYMMETRIC_ENCRYPTION_KEY, TIME_COST);
            expect(typeof encrypted).toBe("string");
            expect(encrypted.length).toBe(195);
            const decrypted = service.decipherHardSymmetric(encrypted, process.env.SYMMETRIC_ENCRYPTION_KEY, TIME_COST);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(0);
            expect(decrypted).toBe("");
        });
        it("Hard decipher content with null content", () => {
            const encrypted = service.cipherHardSymmetric(null, process.env.SYMMETRIC_ENCRYPTION_KEY, TIME_COST);
            expect(typeof encrypted).toBe("string");
            expect(encrypted.length).toBe(195);
            const decrypted = service.decipherHardSymmetric(encrypted, process.env.SYMMETRIC_ENCRYPTION_KEY, TIME_COST);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(0);
            expect(decrypted).toBe("");
        });
        it("Hard decipher content with undefined content", () => {
            const encrypted = service.cipherHardSymmetric(undefined, process.env.SYMMETRIC_ENCRYPTION_KEY, TIME_COST);
            expect(typeof encrypted).toBe("string");
            expect(encrypted.length).toBe(195);
            const decrypted = service.decipherHardSymmetric(encrypted, process.env.SYMMETRIC_ENCRYPTION_KEY, TIME_COST);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(0);
            expect(decrypted).toBe("");
        });
    });

    let keyPair: crypto.KeyPairSyncResult<string, string>;
    describe("Asymmetric encryption tests", () => {
        it("Key generation", async() => {
            keyPair = service.generateKeyPair(1024);
            expect(typeof keyPair).toBe("object");
            expect(keyPair).toHaveProperty("publicKey");
            expect(keyPair).toHaveProperty("privateKey");
            expect(typeof keyPair.publicKey).toBe("string");
            expect(typeof keyPair.privateKey).toBe("string");
        });
        it("Key generation with private encryption key", async() => {
            const localKeyPair = service.generateKeyPair(1024, process.env.ASYMMETRIC_ENCRYPTION_KEY);
            expect(typeof localKeyPair).toBe("object");
            expect(localKeyPair).toHaveProperty("publicKey");
            expect(localKeyPair).toHaveProperty("privateKey");
            expect(typeof localKeyPair.publicKey).toBe("string");
            expect(typeof localKeyPair.privateKey).toBe("string");
        });
        it("Key generation with undefined private encryption key", async() => {
            const localKeyPair = service.generateKeyPair(1024, undefined);
            expect(typeof localKeyPair).toBe("object");
            expect(localKeyPair).toHaveProperty("publicKey");
            expect(localKeyPair).toHaveProperty("privateKey");
            expect(typeof localKeyPair.publicKey).toBe("string");
            expect(typeof localKeyPair.privateKey).toBe("string");
        });
        it("Key generation with null private encryption key", async() => {
            const localKeyPair = service.generateKeyPair(1024, null);
            expect(typeof localKeyPair).toBe("object");
            expect(localKeyPair).toHaveProperty("publicKey");
            expect(localKeyPair).toHaveProperty("privateKey");
            expect(typeof localKeyPair.publicKey).toBe("string");
            expect(typeof localKeyPair.privateKey).toBe("string");
        });
        it("Generate key pair with negative modulus length", async() => {
            expect(() => service.generateKeyPair(-1, process.env.ASYMMETRIC_ENCRYPTION_KEY)).toThrow("The value of \"options.modulusLength\" is out of range. It must be >= 0 && <= 4294967295. Received -1");
        });
        it("Encrypt content", async() => {
            const encrypted = service.encryptAsymmetric(content, keyPair.publicKey);
            expect(typeof encrypted).toBe("string");
            const decrypted = service.decryptAsymmetric(encrypted, keyPair.privateKey);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(content.length);
            expect(decrypted).toBe(content);
        });
        it("Decrypt asymmetric with wrong key", async() => {
            const encrypted = service.encryptAsymmetric(content, keyPair.publicKey);
            expect(() => service.decryptAsymmetric(encrypted, "wrong_key")).toThrow("error:1E08010C:DECODER routines::unsupported");
        });
        it("Encrypt content with empty content", async() => {
            const encrypted = service.encryptAsymmetric("", keyPair.publicKey);
            expect(typeof encrypted).toBe("string");
            const decrypted = service.decryptAsymmetric(encrypted, keyPair.privateKey);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(0);
            expect(decrypted).toBe("");
        });
        it("Encrypt content with null content", async() => {
            const encrypted = service.encryptAsymmetric(null, keyPair.publicKey);
            expect(typeof encrypted).toBe("string");
            const decrypted = service.decryptAsymmetric(encrypted, keyPair.privateKey);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(0);
            expect(decrypted).toBe("");
        });
        it("Encrypt content with undefined content", async() => {
            const encrypted = service.encryptAsymmetric(undefined, keyPair.publicKey);
            expect(typeof encrypted).toBe("string");
            const decrypted = service.decryptAsymmetric(encrypted, keyPair.privateKey);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(0);
            expect(decrypted).toBe("");
        });
        it("Encrypt content with private encryption key", async() => {
            const encrypted = service.encryptAsymmetric(content, keyPair.publicKey);
            expect(typeof encrypted).toBe("string");
            const decrypted = service.decryptAsymmetric(encrypted, keyPair.privateKey, process.env.ASYMMETRIC_ENCRYPTION_KEY);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(content.length);
            expect(decrypted).toBe(content);
        });
        it("Encrypt content with null encryption key", async() => {
            const encrypted = service.encryptAsymmetric(content, keyPair.publicKey);
            expect(typeof encrypted).toBe("string");
            const decrypted = service.decryptAsymmetric(encrypted, keyPair.privateKey, null);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(content.length);
            expect(decrypted).toBe(content);
        });
        it("Encrypt content with undefined encryption key", async() => {
            const encrypted = service.encryptAsymmetric(content, keyPair.publicKey);
            expect(typeof encrypted).toBe("string");
            const decrypted = service.decryptAsymmetric(encrypted, keyPair.privateKey, undefined);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(content.length);
            expect(decrypted).toBe(content);
        });
        it("Encrypt content with encryption key and encrypted private key", async() => {
            keyPair = service.generateKeyPair(1024, process.env.ASYMMETRIC_ENCRYPTION_KEY);
            const encrypted = service.encryptAsymmetric(content, keyPair.publicKey);
            expect(typeof encrypted).toBe("string");
            const decrypted = service.decryptAsymmetric(encrypted, keyPair.privateKey, process.env.ASYMMETRIC_ENCRYPTION_KEY);
            expect(typeof decrypted).toBe("string");
            expect(decrypted.length).toBe(content.length);
            expect(decrypted).toBe(content);
        });
        it("Decrypt asymmetric with wrong encrypted private key and correct private encryption key", async() => {
            keyPair = service.generateKeyPair(1024, process.env.ASYMMETRIC_ENCRYPTION_KEY);
            const encrypted = service.encryptAsymmetric(content, keyPair.publicKey);
            expect(() => service.decryptAsymmetric(encrypted, "wrong_key", process.env.ASYMMETRIC_ENCRYPTION_KEY)).toThrow("error:1E08010C:DECODER routines::unsupported");
        });
        it("Encrypt content with no private encryption key and encrypted private key", async() => {
            keyPair = service.generateKeyPair(1024, process.env.ASYMMETRIC_ENCRYPTION_KEY);
            const encrypted = service.encryptAsymmetric(content, keyPair.publicKey);
            expect(typeof encrypted).toBe("string");
            expect(() => service.decryptAsymmetric(encrypted, keyPair.privateKey)).toThrow("error:07880109:common libcrypto routines::interrupted or cancelled");
        });
        it("Encrypt content with null private encryption key and encrypted private key", async() => {
            keyPair = service.generateKeyPair(1024, process.env.ASYMMETRIC_ENCRYPTION_KEY);
            const encrypted = service.encryptAsymmetric(content, keyPair.publicKey);
            expect(typeof encrypted).toBe("string");
            expect(() => service.decryptAsymmetric(encrypted, keyPair.privateKey, null)).toThrow("error:07880109:common libcrypto routines::interrupted or cancelled");
        });
        it("Encrypt content with undefined private encryption key and encrypted private key", async() => {
            keyPair = service.generateKeyPair(1024, process.env.ASYMMETRIC_ENCRYPTION_KEY);
            const encrypted = service.encryptAsymmetric(content, keyPair.publicKey);
            expect(typeof encrypted).toBe("string");
            expect(() => service.decryptAsymmetric(encrypted, keyPair.privateKey, undefined)).toThrow("error:07880109:common libcrypto routines::interrupted or cancelled");
        });
        it("Encrypt content with wrong private encryption key and encrypted private key", async() => {
            keyPair = service.generateKeyPair(1024, process.env.ASYMMETRIC_ENCRYPTION_KEY);
            const encrypted = service.encryptAsymmetric(content, keyPair.publicKey);
            expect(typeof encrypted).toBe("string");
            expect(() => service.decryptAsymmetric(encrypted, keyPair.privateKey, "invalid_key")).toThrow("error:1C800064:Provider routines::bad decrypt");
        });
        it("Decrypt asymmetric with wrong encrypted private key", async() => {
            keyPair = service.generateKeyPair(1024, process.env.ASYMMETRIC_ENCRYPTION_KEY);
            const encrypted = service.encryptAsymmetric(content, keyPair.publicKey);
            expect(() => service.decryptAsymmetric(encrypted, keyPair.privateKey, "wrong_key")).toThrow("error:1C800064:Provider routines::bad decrypt");
        });
    });

    describe("Generation tests", () => {
        it("Generate random bytes", () => {
            const random = service.generateRandomBytes(32);
            expect(typeof random).toBe("string");
            expect(random.length).toBe(64);
        });
        it("Generate random numbers", () => {
            const random = service.generateRandomNumbers(32);
            expect(typeof random).toBe("string");
            expect(random.length).toBe(32);
        });
        it("Generate uuid v1", () => {
            const uuid = service.generateUuid(1);
            expect(typeof uuid).toBe("string");
            expect(uuid.length).toBe(36);
        });
        it("Generate uuid v4", () => {
            const uuid = service.generateUuid(4);
            expect(typeof uuid).toBe("string");
            expect(uuid.length).toBe(36);
        });
        it("Generate uuid v6", () => {
            const uuid = service.generateUuid(6);
            expect(typeof uuid).toBe("string");
            expect(uuid.length).toBe(36);
        });
        it("Generate uuid v7", () => {
            const uuid = service.generateUuid(7);
            expect(typeof uuid).toBe("string");
            expect(uuid.length).toBe(36);
        });
        it("Generate uuid with invalid version", () => {
            expect(() => service.generateUuid(0)).toThrow(Error);
        });
    });
});
