/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/unbound-method */
import HederaJS from '../src/hedera';

describe('HederaJS', () => {
  describe('init', () => {
    it('HederaJS should be declared', () => {
      expect(HederaJS).toBeDefined();
    });
    it('HederaJS.init should be declared', () => {
      expect(HederaJS.init).toBeDefined();
    });
    it('HederaJS.start should be declared', () => {
      expect(HederaJS.start).toBeDefined();
    });
    it('HederaJS.onUpdate should be declared', () => {
      expect(HederaJS.onUpdate).toBeDefined();
    });
    it('HederaJS.onMouseDown should be declared', () => {
      expect(HederaJS.onMouseDown).toBeDefined();
    });
    it('HederaJS.onMouseMove should be declared', () => {
      expect(HederaJS.onMouseMove).toBeDefined();
    });
    it('HederaJS.loadScene should be declared', () => {
      expect(HederaJS.loadScene).toBeDefined();
    });
  });
});
