import bunyan     from 'bunyan';
import { expect } from 'chai';
import sinon      from 'sinon';

import logger from '../';

function stub() {
    sinon.stub(process.stdout, 'write').returns(null);
}

function restore() {
    process.stdout.write.restore();
}

describe('Logger', () => {
    it('should warn when no configuration is specified', () => {
        stub();

        logger.get();
        let ref = process.stdout.write;

        restore();

        expect(ref.called).to.equal(true);
        let msg = JSON.parse(ref.getCall(0).args[0]);
        let level = bunyan.nameFromLevel[msg.level];
        expect(level.toLowerCase()).to.equal('warn');
    });

    it('should be configurable', () => {
        let config = {
            name: 'test-logger'
        };

        stub();
        logger.configure(config);
        let log = logger.get();
        log.info('testing');
        let ref = process.stdout.write;

        restore();

        expect(ref.called).to.equal(true);
        let msg = JSON.parse(ref.getCall(0).args[0]);
        expect(msg.name).to.equal('test-logger');
    });

    it('should not write lower level than configured', () => {
        let config = {
            level: 'info'
        };

        stub();
        logger.configure(config);
        let log = logger.get();
        log.debug('testing');
        let ref = process.stdout.write;

        restore();

        expect(ref.called).to.equal(false);
    });

    it('should allow for module loggers', () => {
        let config = {
            name: 'test-logger'
        };

        stub();
        logger.configure(config);
        let log = logger.get('Test');
        log.info('testing');
        let ref = process.stdout.write;

        restore();

        expect(ref.called).to.equal(true);
        let msg = JSON.parse(ref.getCall(0).args[0]);
        expect(msg.name).to.equal('test-logger');
        expect(msg.module).to.equal('Test');
        expect(msg.msg).to.equal('testing');
    });
});
