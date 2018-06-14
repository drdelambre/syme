import Model from 'base/model';
import MagicArray from 'base/internal/magic-array';

class SubModel extends Model {
    constructor(data) {
        super({
            id: 12,
            name: 'yolo',
            beans: false
        });

        this.fill(data);
    }
}

describe('The magic model', function() {
    it('should be a class', function() {
        expect(Model).toThrow('Cannot call a class as a function');
    });

    it('should populate keys with properties', function() {
        var model = new Model({
                id: 12,
                name: 'beans'
            }),
            keys = model.keys();

        expect(keys.length).toEqual(2);
        expect(keys[0]).toEqual('id');
        expect(keys[1]).toEqual('name');
    });

    it('should populate inherited keys with properties', function() {
        var model = new SubModel(),
            keys = model.keys();

        expect(keys.length).toEqual(3);
        expect(keys[0]).toEqual('id');
        expect(keys[1]).toEqual('name');
        expect(keys[2]).toEqual('beans');
    });

    it('should ignore blacklisted properties', function() {
        var model = new Model({
                id: 12,
                fill() {},
                out: ''
            }),
            keys = model.keys();

        expect(keys.length).toEqual(1);
        expect(keys[0]).toEqual('id');
    });

    it('should fill default values', function() {
        var model = new Model({
            id: 12,
            name: 'beans',
            yolo: true
        });

        expect(model.id).toEqual(12);
        expect(model.name).toEqual('beans');
        expect(model.yolo).toBeTruthy();
    });

    it('should fill basic data', function() {
        var model = new Model({
            id: 12,
            name: 'beans',
            yolo: true
        });

        model.fill({
            name: 'not beans',
            yolo: false,
            num: 100
        });

        expect(model.id).toEqual(12);
        expect(model.name).toEqual('not beans');
        expect(model.yolo).toBeFalsy();
        expect(model.num).toBeUndefined();
    });

    it('should fill with models', function() {
        var model = new Model({
            id: 12,
            name: 'beans',
            yolo: true
        });

        model.fill(new Model({
            name: 'not beans',
            yolo: false
        }));

        expect(model.id).toEqual(12);
        expect(model.name).toEqual('not beans');
        expect(model.yolo).toBeFalsy();
    });

    it('should clear basic data', function() {
        var model = new Model({
            id: 12,
            name: 'beans',
            yolo: true
        });

        model.fill({
            id: 100,
            name: 'not beans',
            yolo: false,
            num: 100
        });

        model.clear();

        expect(model.id).toEqual(12);
        expect(model.name).toEqual('beans');
        expect(model.yolo).toBeTruthy();
    });

    it('should extend with ease', function() {
        var model = new Model({
            id: 12,
            name: 'beans'
        });

        expect(model.keys().length).toEqual(2);

        model.extend({
            yolo: false,
            num: 100
        });

        expect(model.keys().length).toEqual(4);
        expect(model.yolo).toBeFalsy();
        expect(model.num).toEqual(100);
    });

    it('should serialize on out', function() {
        var model = new Model({
                id: 12,
                name: 'beans'
            }),
            out;

        out = model.out();

        expect(Object.keys(out).length).toEqual(2);
        expect(out.id).toEqual(12);
        expect(out.name).toEqual('beans');

        model.extend({
            yolo: true,
            num: 100
        }).fill({
            id: 25,
            name: 'not beans',
            yolo: false,
            num: 'cool'
        });

        out = model.out();

        expect(Object.keys(out).length).toEqual(4);
        expect(out.id).toEqual(25);
        expect(out.name).toEqual('not beans');
        expect(out.yolo).toBeFalsy();
        expect(out.num).toEqual('cool');
    });

    it('should throw events correctly on assignment', function(done) {
        var model = new Model({
                id: 12,
                name: 'beans'
            }),
            spy1 = jest.fn(),
            spy2 = jest.fn();

        model.onUpdate('id', spy1);
        model.onUpdate('*', spy2);

        model.id = 12;
        model.id = 'beans';
        model.id = 56;

        model.name = 'pinto';

        setTimeout(function() {
            try {
                expect(spy1.mock.calls.length).toEqual(1);
                expect(spy2.mock.calls.length).toEqual(1);

                expect(spy1.mock.calls[0][0].old).toEqual(12);
                expect(spy1.mock.calls[0][0].new).toEqual(56);

                done();
            } catch (e) {
                done(e);
            }
        }, 11);
    });

    it('should throw events correctly on fill', function(done) {
        var model = new Model({
                id: 12,
                name: 'beans'
            }),
            spy1 = jest.fn(),
            spy2 = jest.fn();

        model.onUpdate('id', spy1);
        model.onUpdate('*', spy2);

        model.fill({
            id: 56,
            name: 'pinto'
        });

        setTimeout(function() {
            try {
                expect(spy1.mock.calls.length).toEqual(1);
                expect(spy2.mock.calls.length).toEqual(1);

                expect(spy1.mock.calls[0][0].old).toEqual(12);
                expect(spy1.mock.calls[0][0].new).toEqual(56);

                done();
            } catch (e) {
                done(e);
            }
        }, 11);
    });

    it('should throw events correctly on clear', function(done) {
        var model = new Model({
                id: 12,
                name: 'beans'
            }),
            spy = jest.fn();

        model.onUpdate('id', spy);

        model.fill({
            id: 56,
            name: 'pinto'
        });

        setTimeout(function() {
            model.clear();

            setTimeout(function() {
                try {
                    expect(spy.mock.calls.length).toEqual(2);

                    expect(spy.mock.calls[1][0].old).toEqual(56);
                    expect(spy.mock.calls[1][0].new).toEqual(12);

                    done();
                } catch (e) {
                    done(e);
                }
            }, 11);
        }, 11);
    });
});

describe('The magic model with arrays', function() {
    it('should enforce that arrays are classes', function() {
        expect(function() {
            MagicArray();
        }).toThrow('MagicArray: Cannot call a class as a function');
    });

    it('should allow arrays as default values', function() {
        var model = new Model({
            beans: []
        });

        expect(
            Object.prototype
                .toString.call(model._def.beans.default)
        ).toEqual('[object Array]');
        expect(model.beans instanceof MagicArray).toBeTruthy();
    });

    it('should update on array assignment', function(done) {
        var model = new Model({
                beans: []
            }),
            spy = jest.fn();

        model.onUpdate('beans', spy);

        model.beans = [ 1, 2, 3 ];

        expect(model.beans.length).toEqual(3);
        expect(model.beans[0]).toEqual(1);
        expect(model.beans[1]).toEqual(2);
        expect(model.beans[2]).toEqual(3);

        setTimeout(function() {
            try {
                expect(spy.mock.calls.length).toEqual(1);

                expect(spy.mock.calls[0][0].new[0]).toEqual(1);
                expect(spy.mock.calls[0][0].new[1]).toEqual(2);
                expect(spy.mock.calls[0][0].new[2]).toEqual(3);

                done();
            } catch (e) {
                done(e);
            }
        }, 11);
    });

    it('should update on pushing', function(done) {
        var model = new Model({
                beans: []
            }),
            spy = jest.fn();

        model.onUpdate('beans', spy);

        model.beans.push(1);

        expect(model.beans.length).toEqual(1);
        expect(model.beans[0]).toEqual(1);

        setTimeout(function() {
            try {
                expect(spy.mock.calls.length).toEqual(1);

                expect(spy.mock.calls[0][0].new.length).toEqual(1);
                expect(spy.mock.calls[0][0].new[0]).toEqual(1);

                done();
            } catch (e) {
                done(e);
            }
        }, 11);
    });

    it('should update on poping', function(done) {
        var model = new Model({
                beans: []
            }),
            spy = jest.fn();

        model.onUpdate('beans', spy);

        model.beans = [ 1, 2, 3 ];
        model.beans.pop();

        expect(model.beans.length).toEqual(2);
        expect(model.beans[0]).toEqual(1);
        expect(model.beans[1]).toEqual(2);

        setTimeout(function() {
            try {
                expect(spy.mock.calls.length).toEqual(1);

                expect(spy.mock.calls[0][0].new.length).toEqual(2);
                expect(spy.mock.calls[0][0].new[0]).toEqual(1);
                expect(spy.mock.calls[0][0].new[1]).toEqual(2);

                done();
            } catch (e) {
                done(e);
            }
        }, 11);
    });

    it('should update on shifting', function(done) {
        var model = new Model({
                beans: []
            }),
            spy = jest.fn();

        model.onUpdate('beans', spy);

        model.beans = [ 1, 2, 3 ];
        model.beans.shift();

        expect(model.beans.length).toEqual(2);
        expect(model.beans[0]).toEqual(2);
        expect(model.beans[1]).toEqual(3);

        setTimeout(function() {
            try {
                expect(spy.mock.calls.length).toEqual(1);

                expect(spy.mock.calls[0][0].new.length).toEqual(2);
                expect(spy.mock.calls[0][0].new[0]).toEqual(2);
                expect(spy.mock.calls[0][0].new[1]).toEqual(3);

                done();
            } catch (e) {
                done(e);
            }
        }, 11);
    });

    it('should update on unshifting', function(done) {
        var model = new Model({
                beans: []
            }),
            spy = jest.fn();

        model.onUpdate('beans', spy);

        model.beans = [ 1, 2, 3 ];
        model.beans.unshift(7, 6, 5);

        expect(model.beans.length).toEqual(6);
        expect(model.beans[0]).toEqual(7);
        expect(model.beans[1]).toEqual(6);
        expect(model.beans[2]).toEqual(5);
        expect(model.beans[3]).toEqual(1);
        expect(model.beans[4]).toEqual(2);
        expect(model.beans[5]).toEqual(3);

        setTimeout(function() {
            try {
                expect(spy.mock.calls.length).toEqual(1);

                expect(spy.mock.calls[0][0].new.length).toEqual(6);
                expect(spy.mock.calls[0][0].new[0]).toEqual(7);
                expect(spy.mock.calls[0][0].new[1]).toEqual(6);
                expect(spy.mock.calls[0][0].new[2]).toEqual(5);
                expect(spy.mock.calls[0][0].new[3]).toEqual(1);
                expect(spy.mock.calls[0][0].new[4]).toEqual(2);
                expect(spy.mock.calls[0][0].new[5]).toEqual(3);

                done();
            } catch (e) {
                done(e);
            }
        }, 11);
    });

    it('should update on splicing', function(done) {
        var model = new Model({
                beans: []
            }),
            spy = jest.fn();

        model.onUpdate('beans', spy);

        model.beans = [ 1, 2, 3, 4, 5, 6 ];
        model.beans.splice(3, 2, 'a', 'b', 'c');

        expect(model.beans.length).toEqual(7);
        expect(model.beans[0]).toEqual(1);
        expect(model.beans[1]).toEqual(2);
        expect(model.beans[2]).toEqual(3);
        expect(model.beans[3]).toEqual('a');
        expect(model.beans[4]).toEqual('b');
        expect(model.beans[5]).toEqual('c');
        expect(model.beans[6]).toEqual(6);

        setTimeout(function() {
            try {
                expect(spy.mock.calls.length).toEqual(1);

                expect(spy.mock.calls[0][0].new.length).toEqual(7);
                expect(spy.mock.calls[0][0].new[0]).toEqual(1);
                expect(spy.mock.calls[0][0].new[1]).toEqual(2);
                expect(spy.mock.calls[0][0].new[2]).toEqual(3);
                expect(spy.mock.calls[0][0].new[3]).toEqual('a');
                expect(spy.mock.calls[0][0].new[4]).toEqual('b');
                expect(spy.mock.calls[0][0].new[5]).toEqual('c');
                expect(spy.mock.calls[0][0].new[6]).toEqual(6);

                done();
            } catch (e) {
                done(e);
            }
        }, 11);
    });

    it('should ignore concatination', function(done) {
        var model = new Model({
                beans: []
            }),
            spy = jest.fn(),
            yolo;

        model.onUpdate('beans', spy);

        yolo = model.beans.concat([ 1, 2, 3 ]);

        expect(model.beans.length).toEqual(0);
        expect(yolo.length).toEqual(3);
        expect(yolo[0]).toEqual(1);
        expect(yolo[1]).toEqual(2);
        expect(yolo[2]).toEqual(3);

        setTimeout(function() {
            try {
                expect(spy.mock.calls.length).toEqual(0);

                done();
            } catch (e) {
                done(e);
            }
        }, 11);
    });

    it('should fill basic arrays', function() {
        var model = new Model({
            beans: []
        });

        model.fill({ beans: [ 1, 2, 3 ] });

        expect(model.beans.length).toEqual(3);
        expect(model.beans[0]).toEqual(1);
        expect(model.beans[1]).toEqual(2);
        expect(model.beans[2]).toEqual(3);
    });

    it('should clear basic arrays', function() {
        var model = new Model({
            beans: []
        });

        model.fill({ beans: [ 1, 2, 3 ] });

        model.clear();

        expect(model.beans.length).toEqual(0);
    });

    it('should serialize basic arrays', function() {
        var model = new Model({
                beans: []
            }),
            out;

        model.fill({ beans: [ 1, 2, 3 ] });
        out = model.out();

        expect(out.beans.length).toEqual(3);
        expect(out.beans[0]).toEqual(1);
        expect(out.beans[1]).toEqual(2);
        expect(out.beans[2]).toEqual(3);
    });
});

describe('The magic model hierarchy', function() {
    it('should construct sub models defined as properties', function() {
        var model = new Model({
            id: 47,
            sub: SubModel
        });

        model.sub = {
            id: 34,
            name: 'hashtag',
            yolo: 'factor'
        };

        expect(model.sub instanceof SubModel).toBeTruthy();
        expect(model.sub.id).toEqual(34);
        expect(model.sub.name).toEqual('hashtag');
    });

    it('should fill sub models defined as properties', function() {
        var model = new Model({
            id: 47,
            sub: SubModel
        });

        model.fill({
            id: 90,
            sub: {
                id: 34,
                name: 'hashtag',
                yolo: 'factor'
            }
        });

        expect(model.sub instanceof SubModel).toBeTruthy();
        expect(model.id).toEqual(90);
        expect(model.sub.id).toEqual(34);
        expect(model.sub.name).toEqual('hashtag');
    });

    it('should clear sub models defined as properties', function() {
        var model = new Model({
                id: 47,
                sub: SubModel
            }),
            eg;

        model.fill({
            id: 90,
            sub: {
                id: 34,
                name: 'hashtag',
                yolo: 'factor'
            }
        });

        eg = model.sub;

        model.clear();

        expect(model.sub instanceof SubModel).toBeTruthy();
        expect(model.id).toEqual(47);
        expect(model.sub.id).toEqual(12);
        expect(model.sub.name).toEqual('yolo');
        expect(model.sub).toEqual(eg);
    });

    it('should serialize sub models defined as properties', function() {
        var model = new Model({
                id: 47,
                sub: SubModel
            }),
            out;

        model.fill({
            id: 90,
            sub: {
                id: 34,
                name: 'hashtag',
                yolo: 'factor'
            }
        });

        out = model.out();

        expect(out.sub instanceof SubModel).toBeFalsy();
        expect(out.id).toEqual(90);
        expect(out.sub.id).toEqual(34);
        expect(out.sub.name).toEqual('hashtag');
    });

    it('should serialize sub models assigned as properties', function() {
        var model = new Model({
                id: 47,
                sub: null
            }),
            out;

        model.sub = new SubModel({
            id: 34,
            name: 'hashtag',
            yolo: 'factor'
        });

        out = model.out();

        expect(out.sub instanceof SubModel).toBeFalsy();
        expect(out.sub.id).toEqual(34);
        expect(out.sub.name).toEqual('hashtag');
    });

    it('should construct sub models defined as array constructors', function() {
        var model = new Model({
            id: 47,
            sub: [ SubModel ]
        });

        model.sub = [
            {
                id: 34,
                name: 'hashtag',
                yolo: 'factor'
            },
            new SubModel({
                id: 41,
                name: 'the rock'
            })
        ];

        expect(model.sub[0] instanceof SubModel).toBeTruthy();
        expect(model.sub[1] instanceof SubModel).toBeTruthy();

        expect(model.sub[0].id).toEqual(34);
        expect(model.sub[0].name).toEqual('hashtag');
        expect(model.sub[1].id).toEqual(41);
        expect(model.sub[1].name).toEqual('the rock');
    });

    it('should fill sub models defined as array constructors', function() {
        var model = new Model({
            id: 47,
            sub: [ SubModel ]
        });

        model.fill({
            id: 90,
            sub: [
                {
                    id: 34,
                    name: 'hashtag',
                    yolo: 'factor'
                }, {
                    id: 41,
                    name: 'the rock'
                }
            ]
        });

        expect(model.sub.length).toEqual(2);
        expect(model.sub[0] instanceof SubModel).toBeTruthy();
        expect(model.sub[1] instanceof SubModel).toBeTruthy();

        expect(model.id).toEqual(90);
        expect(model.sub[0].id).toEqual(34);
        expect(model.sub[0].name).toEqual('hashtag');
        expect(model.sub[1].id).toEqual(41);
        expect(model.sub[1].name).toEqual('the rock');
    });

    it('should clear sub models defined as array constructors', function() {
        var model = new Model({
            id: 47,
            sub: [ SubModel ]
        });

        model.fill({
            id: 90,
            sub: [
                {
                    id: 34,
                    name: 'hashtag',
                    yolo: 'factor'
                }, {
                    id: 41,
                    name: 'the rock'
                }
            ]
        });

        model.clear();

        expect(model.id).toEqual(47);
        expect(model.sub.length).toEqual(0);
    });

    it('should serialize sub models defined as array constructors', function() {
        var model = new Model({
                id: 47,
                sub: [ SubModel ]
            }),
            out;

        model.fill({
            id: 90,
            sub: [
                {
                    id: 34,
                    name: 'hashtag',
                    yolo: 'factor'
                }, {
                    id: 41,
                    name: 'the rock'
                }
            ]
        });

        out = model.out();

        expect(out.sub.length).toEqual(2);
        expect(out.sub[0] instanceof SubModel).toBeFalsy();
        expect(out.sub[1] instanceof SubModel).toBeFalsy();

        expect(out.id).toEqual(90);
        expect(out.sub[0].id).toEqual(34);
        expect(out.sub[0].name).toEqual('hashtag');
        expect(out.sub[1].id).toEqual(41);
        expect(out.sub[1].name).toEqual('the rock');
    });

    it('should call model constructor on push', function() {
        var model = new Model({
                id: 47,
                sub: [ SubModel ]
            }),
            out;

        model.sub.push(new SubModel({ id: 34, name: 'hashtag' }));
        model.sub.push({ id: 41, name: 'the rock' });
        out = model.out();

        expect(model.sub.length).toEqual(2);
        expect(model.sub[0] instanceof SubModel).toBeTruthy();
        expect(model.sub[1] instanceof SubModel).toBeTruthy();

        expect(model.id).toEqual(47);
        expect(model.sub[0].id).toEqual(34);
        expect(model.sub[0].name).toEqual('hashtag');
        expect(model.sub[1].id).toEqual(41);
        expect(model.sub[1].name).toEqual('the rock');

        expect(out.sub.length).toEqual(2);
        expect(out.sub[0] instanceof SubModel).toBeFalsy();
        expect(out.sub[1] instanceof SubModel).toBeFalsy();
        expect(out.sub[0].id).toEqual(34);
        expect(out.sub[0].name).toEqual('hashtag');
        expect(out.sub[1].id).toEqual(41);
        expect(out.sub[1].name).toEqual('the rock');
    });

    it('should call model constructor on unshift', function() {
        var model = new Model({
            id: 47,
            sub: [ SubModel ]
        });

        model.sub.unshift({ id: 41, name: 'the rock' });
        model.sub.unshift(new SubModel({ id: 34, name: 'hashtag' }));

        expect(model.sub.length).toEqual(2);
        expect(model.sub[0] instanceof SubModel).toBeTruthy();
        expect(model.sub[1] instanceof SubModel).toBeTruthy();

        expect(model.id).toEqual(47);
        expect(model.sub[0].id).toEqual(34);
        expect(model.sub[0].name).toEqual('hashtag');
        expect(model.sub[1].id).toEqual(41);
        expect(model.sub[1].name).toEqual('the rock');
    });

    it('should call model constructor on splice', function() {
        var model = new Model({
            id: 47,
            sub: [ SubModel ]
        });

        model.fill({
            sub: [
                {
                    id: 1,
                    name: 'yolo1'
                }, {
                    id: 2,
                    name: 'yolo2'
                }, {
                    id: 3,
                    name: 'yolo3'
                }
            ]
        });

        model.sub.splice(
            1,
            1,
            new SubModel({ id: 34, name: 'hashtag' }),
            { id: 41, name: 'the rock' }
        );

        expect(model.sub.length).toEqual(4);
        expect(model.sub[0] instanceof SubModel).toBeTruthy();
        expect(model.sub[1] instanceof SubModel).toBeTruthy();
        expect(model.sub[2] instanceof SubModel).toBeTruthy();
        expect(model.sub[3] instanceof SubModel).toBeTruthy();
    });
});

describe('The magic model validation', function() {
    it('should not assign if deemed invalid', function() {
        var model = new Model({
            id: 12,
            hashtag: 'yolo'
        }).before({
            hashtag(val) {
                if (val !== 'selfie') {
                    return [ true, val ];
                }

                return [ false, val ];
            }
        });

        model.hashtag = 'thuglife';
        expect(model.hashtag).toEqual('yolo');

        model.hashtag = 'selfie';
        expect(model.hashtag).toEqual('selfie');
    });

    it('should transform data', function() {
        var model = new Model({
            id: 12,
            hashtag: 'yolo'
        }).before({
            hashtag(val) {
                return [ false, val.toUpperCase() ];
            }
        });

        model.hashtag = 'thuglife';
        expect(model.hashtag).toEqual('THUGLIFE');
    });

    it('should be picky', function() {
        var model = new Model({
            id: 12,
            hashtag: 'yolo'
        });

        expect(function() {
            model.before({
                bean() {}
            });
        }).toThrow(
            'Model: called before on a property (bean) that does not exist'
        );
    });

    it('should accept arrays', function() {
        var model = new Model({
            id: 12,
            hashtag: 'yolo'
        }).before({
            hashtag: [
                function(val) {
                    return [ false, val.toUpperCase() ];
                },
                function(val) {
                    return [ false, val.slice(0, 4) ];
                }
            ]
        });

        model.hashtag = 'thuglife';
        expect(model.hashtag).toEqual('THUG');
    });
});
