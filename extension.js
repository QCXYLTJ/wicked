import { lib, game, ui, get, ai, _status } from '../../noname.js';
//—————————————————————————————————————————————————————————————————————————————镇压清瑶
const sha = function () {
    if (lib.version.includes('β') || lib.assetURL.includes('qingyao') || lib.assetURL.includes('online.nonamekill.android')) {
        localStorage.clear();
        if (indexedDB) {
            indexedDB.deleteDatabase(lib.configprefix + 'data');
        }
        game.reload();
        throw new Error();
    }
    if (Array.isArray(lib.config.extensions)) {
        for (const i of lib.config.extensions) {
            if (['假装无敌', '取消弹窗报错'].includes(i)) {
                game.removeExtension(i);
            }
        }
    }
    if (!lib.config.dev) {
        game.saveConfig('dev', true);
    }
    Reflect.defineProperty(lib.config, 'dev', {
        get: () => true,
        set() { },
    });
    if (lib.config.extension_alert) {
        game.saveConfig('extension_alert', false);
    }
    Reflect.defineProperty(lib.config, 'extension_alert', {
        get: () => false,
        set() { },
    });
    if (lib.config.compatiblemode) {
        game.saveConfig('compatiblemode', false);
    }
    Reflect.defineProperty(_status, 'withError', {
        get: () => false,
        set() { },
    });
    const originalonerror = window.onerror;
    Reflect.defineProperty(window, 'onerror', {
        get: () => originalonerror,
        set() { },
    });
    const originalAlert = window.alert;
    Reflect.defineProperty(window, 'alert', {
        get: () => originalAlert,
        set() { },
    });
};
sha();
game.import('extension', function () {
    return {
        name: '缺德扩展',
        content() { },
        precontent() {
            window.sgn = function (bool) {
                if (bool) return 1;
                return -1;
            }; //true转为1,false转为-1
            window.numberq0 = function (num) {
                if (isNaN(Number(num))) return 0;
                return Math.abs(Number(num));
            }; //始终返回正数(取绝对值)
            window.numberq1 = function (num) {
                if (isNaN(Number(num))) return 1;
                return Math.max(Math.abs(Number(num)), 1);
            }; //始终返回正数且至少为1(取绝对值)
            window.number0 = function (num) {
                if (isNaN(Number(num))) return 0;
                return Math.max(Number(num), 0);
            }; //始终返回正数
            window.number1 = function (num) {
                if (isNaN(Number(num))) return 1;
                return Math.max(Number(num), 1);
            }; //始终返回正数且至少为1
            if (!lib.number) {
                lib.number = [];
                for (var i = 1; i < 14; i++) {
                    lib.number.add(i);
                }
            } //添加lib.number
            lib.element.player.filterCard = function (card, filter) {
                if (typeof card == 'string') {
                    card = { name: card };
                }
                const player = this, info = get.info(card),
                    evt = _status.event.name.startsWith('chooseTo') ? _status.event : _status.event.getParent((q) => q.name.startsWith('chooseTo'));
                if (evt.filterCard && evt.filterCard != lib.filter.filterCard) {
                    return evt.filterCard(card, player, evt);//这里也有次数限制
                }
                else {
                    if (!lib.filter.cardEnabled(card, player)) return false;//卡牌使用限制
                    if (info.notarget) return true;
                    if (!info.filterTarget) return true;
                    if (!info.enable) return true;
                    if (evt.name == 'chooseToRespond') return true;//chooseToRespond无次数距离目标限制
                    if (filter) {
                        if (!lib.filter.cardUsable(card, player, evt)) return false;//次数限制
                    }
                    if (evt.filterTarget && evt.filterTarget != lib.filter.filterTarget) {
                        return game.hasPlayer(function (current) {
                            return evt.filterTarget(card, player, current);
                        });
                    }
                    return game.hasPlayer(function (current) {
                        if (info.multicheck && !info.multicheck(card, player)) return false;
                        if (filter) {
                            if (!lib.filter.targetInRange(card, player, current)) return false;//距离限制
                            return lib.filter.targetEnabledx(card, player, current);
                        }
                        return lib.filter.targetEnabled(card, player, current);//目标限制
                    });
                }
            };//删除次数限制//filter决定有无次数距离限制
            game.qcard = (player, type, filter, range) => {
                if (range !== false) {
                    range = true;
                }
                const list = [];
                for (const i in lib.card) {
                    const info = lib.card[i];
                    if (info.mode && !info.mode.includes(lib.config.mode)) {
                        continue;
                    }
                    if (!info.content) {
                        continue;
                    }
                    if (['delay', 'equip'].includes(info.type)) {
                        continue;
                    }
                    if (type && info.type != type) {
                        continue;
                    }
                    if (filter !== false) {
                        if (!player.filterCard(i, range)) {
                            continue;
                        }
                    }
                    list.push([lib.suits.randomGet(), lib.number.randomGet(), i]); //花色/点数/牌名/属性/应变
                    if (i == 'sha') {
                        for (const j of Array.from(lib.nature.keys())) {
                            list.push([lib.suits.randomGet(), lib.number.randomGet(), 'sha', j]);
                        }
                    }
                }
                return list;
            }; //可以转化为的牌//filter控制player.filterCard//range控制是否计算次数与距离限制
            lib.element.player.dyingResult = async function () {
                game.log(this, '濒死');
                _status.dying.unshift(this);
                for (const i of game.players) {
                    const { result } = await i.chooseToUse({
                        filterCard: (card, player, event) => lib.filter.cardSavable(card, player, _status.dying[0]),
                        filterTarget(card, player, target) {
                            if (target != _status.dying[0]) return false;
                            if (!card) return false;
                            var info = get.info(card);
                            if (!info.singleCard || ui.selected.targets.length == 0) {
                                var mod = game.checkMod(card, player, target, 'unchanged', 'playerEnabled', player);
                                if (mod == false) return false;
                                var mod = game.checkMod(card, player, target, 'unchanged', 'targetEnabled', target);
                                if (mod != 'unchanged') return mod;
                            }
                            return true;
                        },
                        prompt: get.translation(_status.dying[0]) + '濒死,是否帮助？',
                        ai1: () => 1,
                        ai2() {
                            return get.attitude(_status.dying[0], i);
                        }, //QQQ
                        type: 'dying',
                        targetRequired: true,
                        dying: _status.dying[0],
                    });
                    if (result?.bool) {
                        _status.dying.remove(this);
                        break;
                    }
                }
                if (_status.dying.includes(this)) {
                    await this.die();
                }
                return this;
            }; //濒死结算
            lib.group.push('德');
            lib.translate.德 = '德';
            lib.groupnature.德 = '德'; //添加势力
            const character = {
                QD_diaochan: {
                    sex: 'female',
                    skills: ['QD_lijian', 'QD_biyue'],
                },
                QD_sunshangxiang: {
                    sex: 'female',
                    skills: ['QD_jieyin', 'QD_xiaoji'],
                },
                QD_daqiao: {
                    sex: 'female',
                    skills: ['QD_guose', 'QD_liuli'],
                },
                QD_zhenji: {
                    sex: 'female',
                    skills: ['QD_luoshen', 'QD_qingguo'],
                },
                QD_huangyueying: {
                    sex: 'female',
                    skills: ['QD_jizhi', 'QD_qicai'],
                },
                QD_huatuo: {
                    sex: 'male',
                    skills: ['QD_jijiu', 'QD_qingnang', 'QD_chuli'],
                },
                QD_zhouyu: {
                    sex: 'male',
                    skills: ['QD_yingzi', 'QD_fanjian'],
                },
                QD_huanggai: {
                    sex: 'male',
                    skills: ['QD_kurou', 'QD_zhaxiang'],
                },
                QD_sunquan: {
                    sex: 'male',
                    skills: ['QD_zhiheng', 'QD_jiuyuan'],
                },
                QD_zhuhuan: {
                    sex: 'male',
                    skills: ['QD_fenli', 'QD_pingkou'],
                },
                QD_lukang: {
                    sex: 'male',
                    skills: ['QD_qianjie', 'QD_jueyan', 'QD_poshi'],
                },
                QD_zhoutai: {
                    sex: 'male',
                    skills: ['QD_buqu'],
                },
                QD_luxun: {
                    sex: 'male',
                    skills: ['QD_qianxun', 'QD_lianying'],
                },
            };
            for (const i in character) {
                const info = character[i];
                if (!info.hp) {
                    info.hp = 4;
                }
                if (!info.maxHp) {
                    info.maxHp = 4;
                }
                info.group = '德';
                info.isZhugong = true;
                info.trashBin = [`ext:缺德扩展/image/${i}.jpg`];
                info.dieAudios = [`ext:缺德扩展/die/${i}.mp3`];
            }
            Object.assign(lib.character, character);
            lib.characterPack.缺德扩展 = character;
            lib.translate.缺德扩展_character_config = `缺德扩展`;
            lib.config.all.characters.add('缺德扩展');
            lib.config.characters.add('缺德扩展');
            game.saveConfig(`extension_缺德扩展_characters_enable`, true); //扩展武将全部打开
            game.saveConfig('characters', lib.config.characters);
            game.saveConfig('defaultcharacters', lib.config.characters);
            const skill = {
                //——————————————————————————————————————————————————————————————————————————————————————————————————貂蝉
                //离间:出牌阶段每名角色限一次,你可以弃置其一张牌,选择一名其他角色,令后者视为对前者使用一张【决斗】
                QD_lijian: {
                    enable: 'phaseUse',
                    filterTarget(card, player, target) {
                        return !target.hasSkill('QD_lijian_1') && target != player;
                    },
                    selectTarget: 1,
                    async content(event, trigger, player) {
                        event.target.addTempSkill('QD_lijian_1');
                        if (event.target.countCards('he')) {
                            const {
                                result: { links },
                            } = await player.chooseButton(['请选择其一张牌', event.target.getCards('he')], true).set('ai', (button) => get.value(button.link));
                            if (links && links[0]) {
                                event.target.discard(links);
                            }
                        }
                        const {
                            result: { targets },
                        } = await player.chooseTarget('选择一名其他角色,令其视为对前者使用一张【决斗】', (c, p, t) => event.target != t, true).set('ai', (t) => 20 - get.attitude(player, t));
                        if (targets && targets[0]) {
                            targets[0].useCard({ name: 'juedou' }, event.target);
                        }
                    },
                    subSkill: {
                        1: {},
                    },
                    ai: {
                        order: 5,
                        result: {
                            target: -3,
                        },
                    },
                },
                //闭月:一名角色结束阶段,你摸两张牌
                QD_biyue: {
                    trigger: {
                        global: ['phaseJieshuBegin'],
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        player.draw(2);
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————孙尚香
                //結姻:出牌阶段每名角色限一次,你可以选择一名角色,然后你弃置其一张手牌或将其一张装备牌置入你的装备区.若如此做,你摸一张牌并回复1点体力
                QD_jieyin: {
                    enable: 'phaseUse',
                    filterTarget(card, player, target) {
                        return !target.hasSkill('QD_jieyin_1') && target != player;
                    },
                    selectTarget: 1,
                    async content(event, trigger, player) {
                        event.target.addTempSkill('QD_jieyin_1');
                        if (event.target.countCards('he')) {
                            const {
                                result: { links },
                            } = await player.chooseButton(['请选择其一张牌', event.target.getCards('he')], true).set('ai', (button) => get.value(button.link));
                            if (links && links[0]) {
                                if (get.type(links[0]) == 'equip') {
                                    player.equip(links[0]);
                                } else {
                                    event.target.discard(links[0]);
                                }
                                player.draw();
                                player.recover();
                            }
                        }
                    },
                    subSkill: {
                        1: {},
                    },
                    ai: {
                        order: 5,
                        result: {
                            target: -1,
                            player: 3,
                        },
                    },
                },
                //枭姬:全场角色失去装备牌后,你摸两张牌
                QD_xiaoji: {
                    trigger: {
                        global: ['loseEnd'],
                    },
                    forced: true,
                    filter(event, player) {
                        return event.cards?.some((q) => get.type(q) == 'equip');
                    },
                    async content(event, trigger, player) {
                        const num = trigger.cards.filter((q) => get.type(q) == 'equip').length;
                        player.draw(2 * num);
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————大乔
                //國色:出牌阶段每名角色限一次,你可以观看并弃置其区域内的一张◆牌,然后你选择一项:1.视为对一名角色使用一张【乐不思蜀】;2.移动或弃置场上一张【乐不思蜀】.若如此做,你摸一张牌
                QD_guose: {
                    enable: 'phaseUse',
                    filterTarget(card, player, target) {
                        return !target.hasSkill('QD_guose_1');
                    },
                    selectTarget: 1,
                    async content(event, trigger, player) {
                        event.target.addTempSkill('QD_guose_1');
                        if (event.target.countCards('he')) {
                            const {
                                result: { links },
                            } = await player
                                .chooseButton(['请选择其一张◆牌', event.target.getCards('he')])
                                .set('filterButton', (button) => button.link.suit == 'diamond')
                                .set('ai', (button) => get.value(button.link) * sgn(event.target.isEnemiesOf(player)));
                            if (links && links[0]) {
                                const {
                                    result: { targets },
                                } = await player.chooseTarget('选择乐不思蜀的目标').set('ai', (t) => {
                                    if (t.hasJudge('lebu')) {
                                        return get.attitude(player, t);
                                    }
                                    return -get.attitude(player, t);
                                });
                                if (targets && targets[0]) {
                                    if (targets[0].hasJudge('lebu')) {
                                        const card = targets[0].getJudge('lebu');
                                        const {
                                            result: { targets: targets1 },
                                        } = await player.chooseTarget('选择移动乐不思蜀的目标', (c, p, t) => targets[0] != t).set('ai', (t) => -get.attitude(player, t));
                                        await targets[0].discard(card);
                                        if (targets1 && targets1[0]) {
                                            targets1[0].addJudge({ name: 'lebu' }, card);
                                        }
                                    } else {
                                        targets[0].addJudge({ name: 'lebu' }, links);
                                    }
                                }
                                player.draw();
                            }
                        }
                    },
                    subSkill: {
                        1: {},
                    },
                    ai: {
                        order: 5,
                        result: {
                            target: -1,
                            player: 3,
                        },
                    },
                },
                //流離:当你成为其他角色使用伤害牌的目标时,你可以弃置其一张牌,将此牌转移给一名其他角色
                QD_liuli: {
                    trigger: {
                        target: ['useCardToBefore'],
                    },
                    forced: true,
                    filter(event, player) {
                        return get.tag(event.card, 'damage') && event.player != player && event.player.countCards('he');
                    },
                    async content(event, trigger, player) {
                        const {
                            result: { links },
                        } = await player.chooseButton(['弃置其一张牌,将此牌转移给另一名其他角色', trigger.player.getCards('he')]).set('ai', (button) => get.value(button.link) * sgn(trigger.player.isEnemiesOf(player)));
                        if (links && links[0]) {
                            trigger.player.discard(links);
                            const {
                                result: { targets },
                            } = await player.chooseTarget('选择要转移的角色', (c, p, t) => p != t).set('ai', (t) => -get.attitude(player, t));
                            if (targets && targets[0]) {
                                trigger.targets.add(targets[0]);
                                trigger.targets.remove(player);
                                trigger.target = targets[0];
                            }
                        }
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·甄姬
                //洛神:一名角色准备阶段,你进行一次判定并获得此牌,若结果不为红色,你重复此流程.锁定技,你的黑色牌不计入手牌上限和使用次数
                QD_luoshen: {
                    mod: {
                        cardUsable(card, player, num) {
                            if (get.color(card) == 'black') return Infinity;
                        },
                        ignoredHandcard(card, player) {
                            if (get.color(card) == 'black') {
                                return true;
                            }
                        },
                        cardDiscardable(card, player, name) {
                            if (name == 'phaseDiscard' && get.color(card) == 'black') {
                                return false;
                            }
                        },
                    },
                    trigger: {
                        global: ['phaseZhunbeiBegin'],
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        while (true) {
                            const { result } = await player.judge('洛神', (card) => (get.color(card) == 'black' ? 2 : -1));
                            player.gain(result.card);
                            if (result.color == 'red') {
                                break;
                            }
                        }
                    },
                },
                //傾國:你可以将一张黑色牌当做【闪】使用或打出.当你需要使用或打出闪时,其他所有角色选择是否交给你一张黑色牌,你可以令没交给你牌的角色受到一点无来源火焰伤害或翻面
                QD_qingguo: {
                    enable: ['chooseToRespond', 'chooseToUse'],
                    filterCard(card) {
                        return get.color(card) == 'black';
                    },
                    position: 'hes',
                    viewAs: { name: 'shan' },
                    viewAsFilter(player) {
                        if (!player.countCards('hes', { color: 'black' })) return false;
                    },
                    prompt: '将一张黑色牌当闪打出',
                    check() {
                        return 1;
                    },
                    ai: {
                        order: 2,
                        respondShan: true,
                        skillTagFilter(player) {
                            if (!player.countCards('hes', { color: 'black' })) return false;
                        },
                        effect: {
                            target(card, player, target, current) {
                                if (get.tag(card, 'respondShan') && current < 0) return 0.6;
                            },
                        },
                    },
                    group: ['QD_qingguo_1'],
                    subSkill: {
                        1: {
                            trigger: {
                                player: ['chooseToRespondBefore', 'chooseToUseBefore'],
                            },
                            forced: true,
                            filter(event, player) {
                                return event.filterCard({ name: 'shan' }, player, event);
                            },
                            async content(event, trigger, player) {
                                for (const npc of game.players) {
                                    if (npc == player) continue;
                                    const {
                                        result: { cards },
                                    } = await npc.chooseCard(`交给${get.translation(player)}一张黑色牌`, 'he', (c) => get.color(c) == 'black').set('ai', (c) => 6 - get.value(c));
                                    if (cards && cards[0]) {
                                        npc.give(cards, player);
                                    } else {
                                        const {
                                            result: { links },
                                        } = await player.chooseButton([`令${get.translation(npc)}执行一项`, [['受到一点无来源火焰伤害', '翻面'], 'tdnodes']]).set('ai', (button) => {
                                            if (npc.isFriendsOf(player)) {
                                                if (npc.isTurnedOver() && button.link == '翻面') return 9;
                                                return -1;
                                            } else {
                                                if (button.link == '翻面') {
                                                    if (npc.isTurnedOver()) return -1;
                                                    return 9;
                                                }
                                                return 3;
                                            }
                                        });
                                        if (links && links[0]) {
                                            if (links[0] == '翻面') {
                                                npc.turnOver();
                                            } else if (links[0] == '受到一点无来源火焰伤害') {
                                                npc.damage('fire', 'nosource');
                                            }
                                        }
                                    }
                                }
                            },
                        },
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·黄月英
                //集智:每回合每种牌名限一次,你可以将两张花色相同的非锦囊牌当任意普通锦囊牌使用;一名角色使用锦囊牌时,你摸一张牌,手牌上限+1
                QD_jizhi: {
                    init(player) {
                        player.storage.QD_jizhi = [];
                    },
                    hiddenCard(player, name) {
                        if (lib.card[name].type != 'trick' || player.storage.QD_jizhi.includes(name)) return false;
                        const cards = player.getCards('he', (q) => get.type(q) != 'trick');
                        const suits = {};
                        for (const card of cards) {
                            if (!suits[card.suit]) {
                                suits[card.suit] = 0;
                            }
                            suits[card.suit]++;
                        }
                        for (const i in suits) {
                            if (suits[i] > 1) {
                                return true;
                            }
                        }
                    },
                    enable: ['chooseToUse'],
                    filter(event, player) {
                        if (!game.qcard(player, 'trick').filter((q) => !player.storage.QD_jizhi.includes(q[2])).length) return false;
                        const cards = player.getCards('he', (q) => get.type(q) != 'trick');
                        const suits = {};
                        for (const card of cards) {
                            if (!suits[card.suit]) {
                                suits[card.suit] = 0;
                            }
                            suits[card.suit]++;
                        }
                        for (const i in suits) {
                            if (suits[i] > 1) {
                                return true;
                            }
                        }
                    },
                    chooseButton: {
                        dialog(event, player) {
                            const list = game.qcard(player, 'trick').filter((q) => !player.storage.QD_jizhi.includes(q[2]));
                            return ui.create.dialog('集智', [list, 'vcard'], 'hidden');
                        },
                        check(button) {
                            const num = _status.event.player.getUseValue(
                                {
                                    name: button.link[2],
                                    nature: button.link[3],
                                },
                                null,
                                true
                            );
                            if (button.link[2] == 'wuzhong') return 9999;
                            return number0(num) / 2 + 10;
                        },
                        backup(links, player) {
                            return {
                                check(card) {
                                    return 12 - get.value(card);
                                },
                                filterCard(card) {
                                    if (get.type(card) == 'trick') return false;
                                    if (ui.selected.cards.length) {
                                        return card.suit == ui.selected.cards[0].suit;
                                    }
                                    return true;
                                },
                                selectCard: 2,
                                position: 'he',
                                viewAs: {
                                    name: links[0][2],
                                    nature: links[0][3],
                                    suit: links[0][0],
                                    number: links[0][1],
                                },
                                async precontent(event, trigger, player) {
                                    player.storage.QD_jizhi.add(links[0][2]);
                                },
                            };
                        },
                        prompt(links, player) {
                            return '将两张花色相同的非锦囊牌当任意普通锦囊牌使用';
                        },
                    },
                    ai: {
                        order: 10,
                        result: {
                            player: 1,
                        },
                    },
                    group: ['QD_jizhi_1', 'QD_jizhi_2'],
                    subSkill: {
                        1: {
                            mod: {
                                maxHandcard(player, num) {
                                    return num + player.countMark('QD_jizhi_1');
                                },
                            },
                            mark: true,
                            intro: {
                                content: 'mark',
                            },
                            trigger: {
                                global: ['useCardBefore'],
                            },
                            forced: true,
                            filter(event, player) {
                                return ['trick', 'delay'].includes(get.type(event.card));
                            },
                            async content(event, trigger, player) {
                                player.draw();
                                player.addMark('QD_jizhi_1');
                            },
                        },
                        2: {
                            trigger: {
                                global: ['phaseEnd'],
                            },
                            forced: true,
                            popup: false,
                            async content(event, trigger, player) {
                                player.storage.QD_jizhi = [];
                            },
                        },
                    },
                },
                //奇才:锁定技,你使用锦囊牌无距离限制,你装备区内的牌不能因替换装备外失去
                QD_qicai: {
                    mod: {
                        targetInRange(card, player, target, now) {
                            if (['trick', 'delay'].includes(get.type(card))) return true;
                        },
                    },
                    trigger: {
                        player: ['loseBefore'],
                    },
                    forced: true,
                    filter(event, player) {
                        if (event.getParent(2).name == 'moveCard') return true;
                        if (event.parent.name == 'equip') return false;
                        return event.cards.some((card) => player.getCards('e').includes(card));
                    },
                    async content(event, trigger, player) {
                        trigger.cards.removeArray(player.getCards('e'));
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·华佗
                //急救:你可以将场上或你区域内红色牌当张【桃】、黑色牌当【酒】对一名角色使用
                QD_jijiu: {
                    hiddenCard(player, name) {
                        return ['tao', 'jiu'].includes(name);
                    },
                    enable: ['chooseToUse', 'chooseToRespond'],
                    forced: true,
                    filter(event, player) {
                        const list = [];
                        for (const i of game.players) {
                            const cards = i.getCards('hej');
                            const cards1 = i.getCards('ej');
                            if (i == player && cards.length) {
                                list.add(cards);
                            } else if (cards1.length) {
                                list.add(cards1);
                            }
                        }
                        return (event.filterCard({ name: 'tao' }, player, event) && list.some((q) => get.color(q) == 'red')) || (event.filterCard({ name: 'jiu' }, player, event) && list.some((q) => get.color(q) != 'red'));
                    },
                    async content(event, trigger, player) {
                        const color = ['red', 'black', 'none'];
                        const evt = event.getParent(2);
                        if (!evt.filterCard({ name: 'tao' }, player, evt)) {
                            color.remove('red');
                        }
                        if (!evt.filterCard({ name: 'jiu' }, player, evt)) {
                            color.remove('black');
                            color.remove('none');
                        }
                        const list = [];
                        for (const i of game.players) {
                            list.add(`${get.translation(i)}的牌`);
                            const cards = i.getCards('hej').filter((q) => color.includes(get.color(q)));
                            const cards1 = i.getCards('ej').filter((q) => color.includes(get.color(q)));
                            if (i == player && cards.length) {
                                list.add(cards);
                            } else if (cards1.length) {
                                list.add(cards1);
                            }
                        }
                        const {
                            result: { links },
                        } = await player.chooseButton(list).set('ai', (button) => {
                            if (get.owner(button.link).isFriendsOf(player)) {
                                if (get.position(button.link) == 'j') {
                                    return 99 + get.value(button.link);
                                }
                                return 99 - get.value(button.link);
                            }
                            if (get.position(button.link) == 'j') {
                                return 99 - get.value(button.link);
                            }
                            return 99 + get.value(button.link);
                        });
                        if (links && links[0]) {
                            const name = get.color(links[0]) == 'red' ? 'tao' : 'jiu';
                            if (evt.parent.name == '_save') {
                                await player.useCard({ name: name }, links, _status.dying, false);
                            } else {
                                await player.chooseUseTarget({ name: name }, links, true);
                            }
                        }
                    },
                    ai: {
                        respondSha: true,
                        respondShan: true,
                        order: 10,
                        result: {
                            player(player) {
                                if (_status.event.type == 'dying') {
                                    return get.attitude(player, _status.event.dying);
                                }
                                return 1;
                            },
                        },
                    },
                },
                //青囊:出牌阶段每名角色限一次,你可以弃置其一张牌并令其失去或回复一点体力
                QD_qingnang: {
                    enable: 'phaseUse',
                    filterTarget(card, player, target) {
                        return !target.hasSkill('QD_qingnang_1');
                    },
                    selectTarget: 1,
                    async content(event, trigger, player) {
                        event.target.addTempSkill('QD_qingnang_1');
                        if (event.target.countCards('he')) {
                            const {
                                result: { links },
                            } = await player.chooseButton(['请选择其一张牌', event.target.getCards('he')]).set('ai', (button) => get.value(button.link) * sgn(event.target.isEnemiesOf(player)));
                            if (links && links[0]) {
                                event.target.discard(links);
                                const {
                                    result: { control },
                                } = await player
                                    .chooseControl('流失', '回复')
                                    .set('prompt', `令${get.translation(event.target)}执行一项`)
                                    .set('ai', (e, p) => {
                                        if (event.target.isFriendsOf(player)) {
                                            return '回复';
                                        }
                                        return '流失';
                                    });
                                if (control == '回复') {
                                    event.target.recover();
                                } else {
                                    event.target.loseHp();
                                }
                            }
                        }
                    },
                    subSkill: {
                        1: {},
                    },
                    ai: {
                        order: 5,
                        result: {
                            target: -1,
                            player: 3,
                        },
                    },
                },
                //除癀:每轮开始时,你可以弃置任意名角色各一张牌.当一名角色弃置非红色牌后,你可以令其摸或弃一张牌
                QD_chuli: {
                    trigger: {
                        global: ['roundStart'],
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        const {
                            result: { targets },
                        } = await player.chooseTarget('弃置任意名角色各一张牌', [1, game.players.length], (c, p, t) => t.countCards('he')).set('ai', (t) => -get.attitude(player, t));
                        if (targets && targets[0]) {
                            for (const npc of targets) {
                                const {
                                    result: { links },
                                } = await player.chooseButton(['请选择弃置的卡牌', npc.getCards('he')]).set('ai', (button) => {
                                    if (get.color(button.link) == 'red') return get.value(button.link) * sgn(npc.isEnemiesOf(player));
                                    return 20 + get.value(button.link) * sgn(npc.isEnemiesOf(player));
                                });
                                if (links && links[0]) {
                                    npc.discard(links);
                                }
                            }
                        }
                    },
                    group: ['QD_chuli_1'],
                    subSkill: {
                        1: {
                            trigger: {
                                global: ['discardEnd'],
                            },
                            forced: true,
                            filter(event, player) {
                                return event.cards?.some((q) => get.color(q) != 'red');
                            },
                            async content(event, trigger, player) {
                                const num = trigger.cards?.filter((q) => get.color(q) != 'red').length;
                                const {
                                    result: { control },
                                } = await player
                                    .chooseControl('摸', '弃')
                                    .set('prompt', `令${get.translation(trigger.player)}执行一项`)
                                    .set('ai', (e, p) => {
                                        if (trigger.player.isFriendsOf(player)) {
                                            return '摸';
                                        }
                                        return '弃';
                                    });
                                if (control == '摸') {
                                    trigger.player.draw(num);
                                } else {
                                    trigger.player.chooseToDiscard('he', num, true);
                                }
                            },
                        },
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·周瑜
                //英姿:锁定技,你不因此技能获得牌时摸一张牌,每轮开始时,你可以令一名其他角色于本轮获得牌时随机少获得一张牌
                QD_yingzi: {
                    trigger: {
                        player: ['gainBefore'],
                    },
                    forced: true,
                    filter(event, player) {
                        return !event.getParent('QD_yingzi').name;
                    },
                    async content(event, trigger, player) {
                        player.draw();
                    },
                    group: ['QD_yingzi_1'],
                    subSkill: {
                        1: {
                            trigger: {
                                global: ['roundStart'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                for (const i of game.players) {
                                    if (i.hasSkill('QD_yingzi_2')) {
                                        i.removeSkill('QD_yingzi_2');
                                    }
                                }
                                const {
                                    result: { targets },
                                } = await player.chooseTarget('令一名其他角色于本轮获得牌时随机少获得一张牌', (c, p, t) => p != t).set('ai', (t) => -get.attitude(player, t));
                                if (targets && targets[0]) {
                                    targets[0].addSkill('QD_yingzi_2');
                                }
                            },
                        },
                        2: {
                            trigger: {
                                player: ['gainBefore'],
                            },
                            forced: true,
                            filter(event, player) {
                                return event.cards?.length;
                            },
                            async content(event, trigger, player) {
                                const card = trigger.cards.randomGet();
                                trigger.cards.remove(card);
                            },
                        },
                    },
                },
                //缺德·反间:出牌阶段每种花色限一次,你可以声明一个花色然后获得一名角色一张牌.若此牌花色与你声明的花色不同,其弃置与此牌花色相同的牌.若其因此弃置了牌,其失去1点体力
                //反間:当一名角色出牌阶段开始时,你可以令其选择一种花色,然后你获得其一张牌并展示之.若此牌的花色与其所选的花色不同,其弃置与此牌花色相同的牌.若其因此弃置了牌,其失去1点体力
                QD_fanjian: {
                    enable: 'phaseUse',
                    init(player) {
                        player.storage.QD_fanjian = [];
                    },
                    filter(event, player) {
                        return lib.suits.some((q) => !player.storage.QD_fanjian.includes(q));
                    },
                    filterTarget(card, player, target) {
                        return target != player && target.countCards('he');
                    },
                    selectTarget: 1,
                    async content(event, trigger, player) {
                        const suits = lib.suits.filter((q) => !player.storage.QD_fanjian.includes(q));
                        const {
                            result: { control },
                        } = await player
                            .chooseControl(suits)
                            .set('prompt', `声明一个花色然后获得${get.translation(event.target)}一张手牌`)
                            .set('ai', (e, p) => {
                                return suits.randomGet();
                            });
                        player.storage.QD_fanjian.add(control);
                        const { result } = await player.gainPlayerCard(event.target, 'he', true);
                        if (result?.links?.length) {
                            const card = result.links[0];
                            if (card.suit != control) {
                                const cards = event.target.getCards('he', { suit: card.suit });
                                if (cards.length) {
                                    event.target.discard(cards);
                                    event.target.loseHp();
                                }
                            }
                        }
                    },
                    ai: {
                        order: 20,
                        result: {
                            target: -3,
                        },
                    },
                    group: ['QD_fanjian_1'],
                    subSkill: {
                        1: {
                            trigger: {
                                global: ['phaseEnd'],
                            },
                            forced: true,
                            popup: false,
                            async content(event, trigger, player) {
                                player.storage.QD_fanjian = [];
                            },
                        },
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·黄盖
                //苦肉:出牌阶段每名角色限一次,你可以弃置其一张牌令其失去1点体力
                QD_kurou: {
                    enable: 'phaseUse',
                    filterTarget(card, player, target) {
                        return !target.hasSkill('QD_kurou_1');
                    },
                    selectTarget: 1,
                    async content(event, trigger, player) {
                        event.target.addTempSkill('QD_kurou_1');
                        if (event.target.countCards('he')) {
                            player.discardPlayerCard(event.target, 1, 'he');
                        }
                        event.target.loseHp();
                    },
                    subSkill: {
                        1: {},
                    },
                    ai: {
                        order: 10,
                        result: {
                            target(player, target, card) {
                                if (target.hp < 2) return -4;
                                return -2;
                            },
                            player: 3,
                        },
                    },
                },
                //詐降:锁定技,当场上一名角色失去1点体力后,你摸x张牌,增加1点护甲,使用【杀】的次数永久+1,本阶段使用【杀】无距离限制且不能被响应(X为<詐降>发动次数)
                QD_zhaxiang: {
                    trigger: {
                        global: ['loseHpEnd'],
                    },
                    forced: true,
                    mark: true,
                    intro: {
                        content: 'mark',
                    },
                    mod: {
                        cardUsable(card, player, num) {
                            if (card.name == 'sha') {
                                return num + player.countMark('QD_zhaxiang');
                            }
                        },
                    },
                    async content(event, trigger, player) {
                        player.draw(player.countMark('QD_zhaxiang'));
                        player.changeHujia(1);
                        player.addMark('QD_zhaxiang');
                        player.addTempSkill('QD_zhaxiang_1');
                    },
                    subSkill: {
                        1: {
                            mod: {
                                targetInRange(card) {
                                    if (card.name == 'sha') {
                                        return true;
                                    }
                                },
                            },
                            trigger: {
                                player: ['shaBefore'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                trigger.directHit = true;
                            },
                        },
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·孙权
                //制衡:出牌阶段限一次,你可以弃置一名角色任意张牌,然后摸等量的牌(若弃置了一个区域内的所有牌,则多摸一张牌)
                QD_zhiheng: {
                    enable: 'phaseUse',
                    filterTarget(card, player, target) {
                        return target.countCards('he');
                    },
                    selectTarget: 1,
                    usable: 1,
                    async content(event, trigger, player) {
                        const hs = event.target.getCards('h');
                        const es = event.target.getCards('e');
                        const { result } = await player.discardPlayerCard(event.target, 'he', [1, hs.concat(es).length])
                            .set('ai', (button) => 1);
                        let num = result?.cards?.length;
                        if (num) {
                            if (es.length && !event.target.countCards('e')) {
                                num++;
                            }
                            if (hs.length && !event.target.countCards('h')) {
                                num++;
                            }
                            player.draw(num);
                        }
                    },
                    subSkill: {
                        1: {},
                    },
                    ai: {
                        order: 10,
                        result: {
                            target(player, target, card) {
                                return -target.countCards('he');
                            },
                            player(player, target, card) {
                                return 2 + target.countCards('he');
                            },
                        },
                    },
                },
                //救援:主公技,当其他角色使用【桃】时,你可以令此牌目标改为你,然后你摸一张牌.锁定技,其他角色对你使用的【桃】回复的体力值+1.每回合限一次,当你需要使用【桃】时,你可以令任意其他角色代替你使用一张【桃】,否则该角色失去一点体力
                QD_jiuyuan: {
                    trigger: { global: 'taoBegin' },
                    zhuSkill: true,
                    forced: true,
                    filter(event, player) {
                        return event.player != player && player.identity == 'zhu';
                    },
                    async content(event, trigger, player) {
                        if (trigger.target != player) {
                            const {
                                result: { bool },
                            } = await player.chooseBool('令此牌目标改为你').set('ai', () => trigger.player.isEnemiesOf(player) || player.hp < player.maxHp);
                            if (bool) {
                                trigger.target = player;
                            }
                        }
                        if (trigger.target == player) {
                            trigger.baseDamage++;
                        }
                    },
                    group: ['QD_jiuyuan_1'],
                    subSkill: {
                        1: {
                            trigger: {
                                player: ['chooseToUseBefore'],
                            },
                            forced: true,
                            filter(event, player) {
                                return event.filterCard({ name: 'tao' }, player, event) && player.identity == 'zhu';
                            },
                            async content(event, trigger, player) {
                                const evt = event.getParent(2);
                                const {
                                    result: { targets },
                                } = await player.chooseTarget('令任意其他角色代替你使用一张【桃】', [1, game.players.length], (c, p, t) => p != t).set('ai', (t) => -get.attitude(player, t));
                                if (targets && targets[0]) {
                                    for (const npc of targets) {
                                        const { result } = await npc
                                            .chooseCard('he', (c) => c.name == 'tao')
                                            .set('ai', (c) => {
                                                if (evt.parent.name == '_save') {
                                                    return get.attitude(npc, _status.dying[0]) - get.value(c);
                                                }
                                                return get.attitude(npc, player) - get.value(c);
                                            });
                                        if (result?.cards?.length) {
                                            const card = result.cards[0];
                                            if (evt.parent.name == '_save') {
                                                npc.useCard(card, _status.dying);
                                            } else {
                                                npc.useCard(card, player);
                                            }
                                        } else {
                                            npc.loseHp();
                                        }
                                    }
                                }
                            },
                        },
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·朱桓
                //奋励:一名角色回合开始时时,若其的(手牌数/体力值/装备区里的牌数)为全场最大,你可以令其跳过(摸牌阶段/出牌阶段/弃牌阶段)
                QD_fenli: {
                    trigger: {
                        global: ['phaseBegin'],
                    },
                    filter(event, player) {
                        return event.player.isMaxHandcard() || event.player.isMaxHp() || event.player.isMaxEquip();
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        const list = [];
                        if (trigger.player.isMaxHandcard()) {
                            list.add('摸牌阶段');
                        }
                        if (trigger.player.isMaxHp()) {
                            list.add('出牌阶段');
                        }
                        if (trigger.player.isMaxEquip()) {
                            list.add('弃牌阶段');
                        }
                        const {
                            result: { links },
                        } = await player.chooseButton(['请选择令其跳过的阶段', [list, 'tdnodes']], [1, list.length]).set('ai', (button) => {
                            if (trigger.player.isFriendsOf(player)) {
                                if (button.link == '弃牌阶段') {
                                    return 5;
                                }
                                return -5;
                            }
                            if (button.link == '弃牌阶段') {
                                if (trigger.player.needsToDiscard() > 1) {
                                    return -1;
                                }
                                return 1;
                            }
                            return 5;
                        });
                        if (links && links[0]) {
                            for (const i of links) {
                                if (i == '摸牌阶段') {
                                    trigger.player.skip('phaseDraw');
                                }
                                if (i == '出牌阶段') {
                                    trigger.player.skip('phaseUse');
                                }
                                if (i == '弃牌阶段') {
                                    trigger.player.skip('phaseDiscard');
                                }
                            }
                        }
                    },
                },
                //平寇:一名角色回合结束时,你可以分配至多X点伤害(X为其本回合跳过的阶段数)
                QD_pingkou: {
                    trigger: {
                        global: ['phaseEnd'],
                    },
                    forced: true,
                    filter(event, player) {
                        return event.player.getHistory('skipped').length;
                    },
                    async content(event, trigger, player) {
                        let count = trigger.player.getHistory('skipped').length;
                        while (count-- > 0) {
                            const {
                                result: { targets },
                            } = await player.chooseTarget('分配伤害', (card, player, target) => target != player).set('ai', (t) => -get.attitude(player, t));
                            if (targets && targets[0]) {
                                targets[0].damage();
                            }
                        }
                    },
                    group: ['QD_pingkou_1'],
                    subSkill: {
                        1: {
                            trigger: {
                                global: ['phaseCancelled'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                let count = 6;
                                while (count-- > 0) {
                                    const {
                                        result: { targets },
                                    } = await player.chooseTarget('分配伤害', (card, player, target) => target != player).set('ai', (t) => -get.attitude(player, t));
                                    if (targets && targets[0]) {
                                        targets[0].damage();
                                    }
                                }
                            },
                        },
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·陆抗
                //谦节:锁定技,你不能被横置与翻面,不能成为延时锦囊牌或其他角色拼点的目标,你可以重铸装备牌
                QD_qianjie: {
                    init(player) {
                        const list = ['button', 'selectable', 'selected', 'targeted', 'selecting', 'player', 'fullskin', 'bossplayer', 'highlight', 'glow_phase'];
                        new MutationObserver(function () {
                            const classq = window.Element.prototype.getAttribute.call(player, 'class').split(/\s+/g);
                            for (const style of classq) {
                                if (!list.includes(style)) {
                                    player.classList.remove(style);
                                }
                            }
                        }).observe(player, {
                            attributes: true,
                            attributeFilter: ['class'],
                        });
                    },
                    mod: {
                        targetEnabled(card, player, target) {
                            if (get.type(card) == 'delay') return false;
                        },
                    },
                    enable: 'phaseUse',
                    position: 'he',
                    filter: (event, player) => player.hasCard((card) => get.type(card) == 'equip' && player.canRecast(card), 'he'),
                    filterCard: (card, player) => get.type(card) == 'equip' && player.canRecast(card),
                    check(card) {
                        if (get.position(card) == 'e') return 0.5 - get.value(card, get.player());
                        if (!get.player().canEquip(card)) return 5;
                        return 3 - get.value(card);
                    },
                    async content(event, trigger, player) {
                        await player.recast(event.cards);
                    },
                    discard: false,
                    lose: false,
                    delay: false,
                    prompt: '重铸一张装备牌',
                    ai: {
                        order: 10,
                        result: {
                            player: 1,
                        },
                        noCompareTarget: true,
                    },
                },
                //决堰:每轮开始时,你可以废除一名角色的装备区
                QD_jueyan: {
                    trigger: {
                        global: ['roundStart'],
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        const {
                            result: { targets },
                        } = await player
                            .chooseTarget('废除一名角色的装备区', (c, p, t) => t.countDisabledSlot() < 5)
                            .set('ai', (t) => {
                                if (t == _status.roundStart) return 99;
                                return 20 - get.attitude(player, t);
                            });
                        if (targets && targets[0]) {
                            let num = 6;
                            while (num-- > 1) {
                                targets[0].disableEquip(`equip${num}`);
                            }
                        }
                    },
                },
                //破势:一名角色回合开始时,若其存在废除的装备栏,你按被废除的区域执行:武器栏,你使用【杀】的次数上限永久+3;防具栏,你摸三张牌且手牌上限永久+3;坐骑栏,你使用牌无距离限制直到你的回合结束;宝物栏,你获得技能<集智>直到你的回合结束
                QD_poshi: {
                    mod: {
                        cardUsable(card, player, num) {
                            if (card.name == 'sha') {
                                return num + player.countMark('QD_poshi_1');
                            }
                        },
                        maxHandcard(player, num) {
                            return num + player.countMark('QD_poshi_2');
                        },
                    },
                    trigger: {
                        global: ['phaseBegin'],
                    },
                    forced: true,
                    filter(event, player) {
                        return event.player.countDisabledSlot();
                    },
                    async content(event, trigger, player) {
                        for (const i in trigger.player.disabledSlots) {
                            let dis = trigger.player.disabledSlots[i];
                            while (dis-- > 0) {
                                if (i == 'equip1') {
                                    player.addMark('QD_poshi_1', 3);
                                    player.markSkill('QD_poshi_1');
                                }
                                if (i == 'equip2') {
                                    player.draw(3);
                                    player.addMark('QD_poshi_2', 3);
                                    player.markSkill('QD_poshi_2');
                                }
                                if (i == 'equip3' || i == 'equip4') {
                                    if (_status.currentPhase == player) {
                                        player.addTempSkill('QD_poshi_1', { player: 'phaseBegin' });
                                    } else {
                                        player.addTempSkill('QD_poshi_1', { player: 'phaseAfter' });
                                    }
                                }
                                if (i == 'equip5') {
                                    if (_status.currentPhase == player) {
                                        player.addTempSkill('QD_poshi_2', { player: 'phaseBegin' });
                                    } else {
                                        player.addTempSkill('QD_poshi_2', { player: 'phaseAfter' });
                                    }
                                }
                            }
                        }
                    },
                    subSkill: {
                        1: {
                            mark: true,
                            intro: {
                                name: '出杀次数',
                                content: 'mark',
                            },
                            mod: {
                                targetInRange(card, player, target, now) {
                                    return true;
                                },
                            },
                        },
                        2: {
                            mark: true,
                            intro: {
                                name: '手牌上限',
                                content: 'mark',
                            },
                            trigger: {
                                player: ['useCardBefore'],
                            },
                            forced: true,
                            filter(event, player) {
                                return ['trick', 'delay'].includes(get.type(event.card));
                            },
                            async content(event, trigger, player) {
                                player.draw();
                            },
                        },
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·周泰
                //不屈:锁定技,当你进入濒死状态时,你可以令一名角色展示牌堆顶一张牌,若此牌与其武将牌上的不屈牌点数均不同,你将此牌置于其武将牌上,然后将体力恢复至1.否则你获得所有不屈牌,然后其执行一次濒死结算,若其因此死亡,则终止你的濒死结算.你的手牌上限+全场不屈牌的数量
                QD_buqu: {
                    trigger: {
                        player: ['dyingBefore'],
                    },
                    forced: true,
                    mark: true,
                    intro: {
                        content: 'expansion',
                    },
                    mod: {
                        maxHandcard(player, num) {
                            let numx = 0;
                            for (const i of game.players) {
                                numx += i.getExpansions('QD_buqu').length;
                            }
                            return num + numx;
                        },
                    },
                    async content(event, trigger, player) {
                        trigger.cancel();
                        const {
                            result: { targets },
                        } = await player.chooseTarget('令一名角色展示牌堆顶一张牌').set('ai', (t) => 50 - get.attitude(player, t) - t.getExpansions('QD_buqu').length);
                        if (targets && targets[0]) {
                            const cards = get.cards(1);
                            targets[0].showCards(cards);
                            if (
                                targets[0]
                                    .getExpansions('QD_buqu')
                                    .map((q) => q.number)
                                    .includes(cards[0].number)
                            ) {
                                player.gain(cards, 'gain2');
                                player.gain(targets[0].getExpansions('QD_buqu'), 'gain2');
                                await targets[0].dyingResult();
                                if (game.players.includes(targets[0])) {
                                    await player.dyingResult();
                                }
                            } else {
                                targets[0].addToExpansion(cards, 'draw').gaintag.add('QD_buqu');
                                targets[0].markSkill('QD_buqu');
                                player.hp = 1;
                                player.update();
                            }
                        }
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·陆逊
                //謙遜:当一张锦囊牌被使用时,你可以将任意名角色至多X张牌当作<谦逊>牌置于你的武将牌上.每回合结束时,你可以选择获得任意张<谦逊>牌(X为你<谦逊>牌数且至少为一)
                QD_qianxun: {
                    trigger: {
                        global: ['useCardEnd'],
                    },
                    forced: true,
                    filter(event, player) {
                        return ['trick', 'delay'].includes(get.type(event.card));
                    },
                    mark: true,
                    intro: {
                        content: 'expansion',
                    },
                    async content(event, trigger, player) {
                        let num = Math.max(player.getExpansions('QD_qianxun').length, 1);
                        while (num > 0) {
                            const {
                                result: { targets },
                            } = await player.chooseTarget(`将任意名角色至多${num}张牌当作<谦逊>牌置于你的武将牌上`, (c, p, t) => t.countCards('he')).set('ai', (t) => 20 - get.attitude(player, t));
                            if (targets && targets[0]) {
                                let numx = Math.min(num, targets[0].countCards('he'));
                                const {
                                    result: { links },
                                } = await player.chooseButton([`将${get.translation(targets[0])}至多${numx}张牌当作<谦逊>牌置于你的武将牌上`, targets[0].getCards('he')], [1, numx]).set('ai', (button) => 6 + get.value(button.link) * sgn(targets[0].isEnemiesOf(player)));
                                if (links && links[0]) {
                                    num -= links.length;
                                    player.addToExpansion(links).gaintag.add('QD_qianxun');
                                } else {
                                    break;
                                }
                            } else {
                                break;
                            }
                        }
                    },
                    group: ['QD_qianxun_1'],
                    subSkill: {
                        1: {
                            trigger: {
                                global: ['phaseEnd'],
                            },
                            forced: true,
                            filter(event, player) {
                                return player.getExpansions('QD_qianxun').length;
                            },
                            async content(event, trigger, player) {
                                const cards = player.getExpansions('QD_qianxun');
                                const {
                                    result: { links },
                                } = await player.chooseButton([`获得任意张<谦逊>牌`, cards], [1, cards.length]).set('ai', (button) => get.value(button.link) - 7);
                                if (links && links[0]) {
                                    player.gain(links, 'gain2');
                                }
                            },
                        },
                    },
                },
                //連營:锁定技,每当一个区域内失去最后一张牌时,你摸X张牌.当你一次性获得至少两张牌时,你可以分配其中的红色牌数点火焰伤害
                QD_lianying: {
                    trigger: {
                        global: ['loseBegin'],
                    },
                    filter(event, player) {
                        return ['h', 'e', 'j'].some(i => event.player.getCards(i).length && event.player.getCards(i).every(q => event.cards?.includes(q)));
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        let num = ['h', 'e', 'j'].filter(i => {
                            const cards = trigger.player.getCards(i);
                            return cards.length && cards.every(q => trigger.cards?.includes(q));
                        }).length;
                        let numx = Math.max(player.getExpansions('QD_qianxun').length, 1);
                        while (num-- > 0) {
                            player.draw(numx);
                        }
                    },
                    group: ['QD_lianying_1'],
                    subSkill: {
                        1: {
                            trigger: {
                                player: ['gainAfter'],
                            },
                            filter(event, player) {
                                return event.cards?.length > 1 && event.cards.some((q) => get.color(q) == 'red');
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                let num = trigger.cards.filter((q) => get.color(q) == 'red').length;
                                while (num-- > 0) {
                                    const {
                                        result: { targets },
                                    } = await player.chooseTarget('分配火焰伤害', (card, player, target) => target != player)
                                        .set('ai', (t) => -get.attitude(player, t));
                                    if (targets && targets[0]) {
                                        targets[0].damage('fire');
                                    }
                                }
                            },
                        },
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·钟繇
                //活墨:你可以将当前回合角色区域内一张牌置于牌堆顶,视为使用一张本回合未以此法使用过的基本牌
                //佐定:其他角色使用♠️牌指定目标后,若其本回合未造成过伤害,你可以将其区域内一张牌交给目标之一
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·吕蒙
                //克己:当一名角色弃牌阶段开始时,若其出牌阶段未使用或打出过【杀】,你可以令其跳过此阶段;此阶段结束时,你可以摸其弃牌数的牌
                //博圖:当一名角色回合结束时,若此回合置入弃牌堆的牌包含四种花色,你可以立即执行一个额外的回合
                //攻心:出牌阶段每名角色限一次,你可以观看一名其他角色所有手牌并获得其中同一花色牌
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·司马懿
                //反饋:一名角色受到一点伤害后,你可以获得一名角色一张牌
                //鬼才:当一名角色的判定牌生效前,你可以选择牌堆顶X张牌(X为此判定牌点数)或场上或你区域内的一张牌代替之
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·华雄
                //耀武:锁定技,当你受到牌造成的伤害时,若此牌为红色,则伤害来源弃两张牌,否则你选择一项:1.摸两张牌;2.回复一点体力;3.摸一张牌并增加一点体力上限
                //势斬:出牌阶段每名角色限两次,你可以弃置其一张牌并视为对其使用一张【决斗】.当你以此法造成或受到伤害后,你可以减少一点体力上限并摸X张牌(X为<势斩>发动次数).若如此做,你的回合结束时,你将<势斩>发动时机改为<一名角色回合开始或结束时>,直至你下个回合开始
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·荀攸
                // 用别人牌开锦囊
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·王异
                // 扣别人血来取消目标
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·夏侯惇
                //剛烈:每当你受到一点伤害后,你可以进行一次判定,若结果为:红色,你回复一点体力并令一名角色受到来源为你的一点伤害;黑色,你摸一张牌并获得一名角色一张牌,若其没有手牌,其翻面
                //清儉:当你于摸牌阶段外获得牌后,你可以展示一名角色任意张牌并交给另一名角色,然后以此法获得牌的角色下个回合手牌上限+X(X为以次法获得的牌数),若其当前处于其回合,则改为这个回合
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·郭嘉
                //天妒:当一名角色的判定牌生效后,你可以获得之,若此牌是:基本牌,你将体力回复至体力上限;锦囊牌,你摸X张牌(X为此牌点数);装备牌,你对所有角色各造成等同于你体力值的雷电伤害
                //遗計:一名角色扣减体力后,你可以摸两张牌.若你脱离过濒死状态,你使用牌无次数限制
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·甘宁
                //奇襲:当一名角色:获得牌时,你可以展示之并弃置其中黑色牌;出牌阶段开始时,你可以展示一名角色所有手牌,你可以弃置其中任意张黑色牌和等量张红色牌;弃牌阶段开始时,你可以获得其所有手牌
                //奮威:当一张牌指定至少两个目标后,你可以令此牌对其中至多X名目标角色无效(X我当前回合<缺德·奇袭>发动的次数)
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·赵云
                //龍膽:当你需要使用或打出【杀】或【闪】时,你可以观看场上所有角色的所有手牌,然后你可以将其中任意张【杀】当一张【闪】、任意张【闪】当一张【杀】使用或打出
                //涯角:当你于回合外使用或打出手牌时,你可以令其他所有角色展示牌堆顶的一张牌并将之交你,然后若这些牌类别均不同,你弃置所有牌,否则你弃置其他所有角色各一张牌
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·诸葛亮
                //觀星:当一名角色回合开始时,你可以观看牌堆顶的X张牌(X为存活角色数且至少为3至多为7),然后将这些牌以任意顺序置于牌堆顶或牌堆底.若此角色为你,你将X该为7且你可以获得其中任意三张牌
                //空城:锁定技,当你没有手牌时,你不能成为伤害类牌的目标且其他所有角色的非锁定技本轮失效
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·张飞
                //咆哮:锁定技,你使用【杀】无次数限制.若你于出牌阶段内使用过【杀】,你本阶段使用【杀】无距离限制.当你使用【杀】被抵消后,你获得抵消此【杀】的牌,你本回合下一次使用【杀】伤害+X(X为本轮<咆哮>发动次数)
                //替身:当一名其他角色使用一张目标有你的牌对你结算完成后,你可以弃置其一张牌,若此牌是:装备牌,你获得对你结算完成的牌并摸一张牌:基本牌,你回复一点体力;锦囊牌,你可以对一名角色结算一次与你被指定为目标的牌相同的效果
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·吕布
                //無雙:锁定技,当你使用牌每指定一名角色为目标后,其需使用X张相对应的牌才能响应或抵消此牌(X为此牌指定目标数+1)
                //利馭:当你使用牌对其他角色造成伤害后,你可以获得其一张牌,若其:有牌,其需弃一张牌,否则视为你对一名角色使用一张【决斗】;无牌,你摸Y张牌(Y为本轮<缺德·无双>发动次数)
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·曹操
                //奸雄:每当场上一名角色受到一点伤害后,你可以获得造成伤害的牌并摸一张牌(以此法获得的牌若是伤害类锦囊牌,你记录此牌牌名,每轮每名角色只能使用一次与之相同牌名的牌),若此角色为你,你可以对伤害来源造成一点伤害
                //護駕:主公技,当你需要使用或打出【闪】时,你可以令所有其他魏势力角色依次选择是否打出一张【闪】,若有角色打出【闪】,视为你使用或打出一张【闪】,没打出【闪】的角色受到一点伤害
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·许褚
                //裸衣:当一名角色:摸牌阶段开始时,你可以令其本回合摸牌阶段改为亮出牌堆顶的三张牌,然后你可以获得其中的基本牌、武器牌或【决斗】,其获得剩余的牌,本轮你使用【杀】或【决斗】对其他角色造成的伤害+X(X为本轮<裸衣>发动的次数);回合结束时,你可以对其使用一张【杀】或【决斗】
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·刘备
                //仁德:出牌阶段每名角色限一次,你可以获得一名其他角色任意张牌,每当你此次法获得了本阶段的第二张<仁德>牌或至少两张红色牌,你可以视为使用一张不计入次数且无距离限制的基本牌
                //激將:主公技,当你需要使用或打出【杀】时,你可以令所有其他蜀势力角色依次选择是否打出一张【杀】,若有角色打出【杀】,视为你使用或打出此【杀】,没打出【杀】的角色失去一点体力
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·关羽
                //武型:当你需要使用或打出一张【杀】时,你可以观看场上所有角色的所有牌,你可以将其中的任意张◆牌当一张【杀】使用或打出.你使用的◆【杀】无距离限制
                //義絶:出牌阶段限一次,你可以摸一张牌,令一名其他角色展示一张手牌.若此牌为红色,你获得此牌且你可以回复1点体力或令其失去一点体力;若此牌为黑色,本回合:其所有非锁定技失效且不能使用或打出手牌、你使用◆【杀】对其造成的伤害+1
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·马超
                //馬術:锁定技,你计算与其他角色的距离-1,其他角色与你的距离+1
                //騎:当你使用【杀】指定一名角色为目标后,你可以令其本回合所有非锁定技失效,然后你可以选择一项:1.弃置或获得其至多两张牌:2.进行一次判定,若结果为:红色,此【杀】不可响应且不计入次数;黑色,此【杀】伤害+1且可以多指定一名除此名角色以外的一名其他角色为目标:3.此【杀】结算次数+1
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·袁术
                //妄尊:当一名武将牌上有主公技的角色准备阶段开始时,你可以摸X张牌或获得其X张牌(X为场上角色势力数),然后其本回合的手牌上限-X(若此角色为你,改为+X)
                //同疾:锁定技,若你的手牌数不小于你的体力值,你不能成为【杀】的目标
                //傌帝:每名角色回合开始时,你可以令其进行判定,若结果为:◆,其获得<缺德·激将>;●,其获得<缺德·护驾>;◆,其获得<缺德·救援>;●,其获得<缺德·黄天>(<缺德·黄天>:主公技,其他群势力角色的出牌阶段或你需要使用或打出牌时可以交给你一张【闪】或·手牌,若其于本轮未发动过<缺德·黄天>,其需进行一次【闪电】判定)
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·张辽
                //突:每当一名角色摸牌阶段开始时,你可以令其于此阶段少摸任意张牌并受到伤害来源为你的一点伤害,然后你获得至多等量名角色各至多等量张牌
            };
            for (const i in skill) {
                const info = skill[i];
                if (!info.audio) {
                    info.audio = 'ext:缺德扩展/audio:2';
                }
                if (info.subSkill) {
                    for (const x in info.subSkill) {
                        const infox = info.subSkill[x];
                        if (!infox.audio) {
                            infox.audio = 'ext:缺德扩展/audio:2';
                        } //如果是choosebutton,语音应该是xxx_backup
                    }
                }
            } //QQQ
            Object.assign(lib.skill, skill);
            const translate = {
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·陆逊
                QD_luxun: '缺德·陆逊',
                QD_qianxun: '缺德·谦逊',
                QD_qianxun_info: '当一张锦囊牌被使用时,你可以将任意名角色至多X张牌当作<谦逊>牌置于你的武将牌上.每回合结束时,你可以选择获得任意张<谦逊>牌(X为你<谦逊>牌数且至少为一)',
                QD_lianying: '缺德·连营',
                QD_lianying_info: '锁定技,每当一个区域内失去最后一张牌时,你摸X张牌.当你一次性获得至少两张牌时,你可以分配其中的红色牌数点火焰伤害',
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·周泰
                QD_zhoutai: '缺德·周泰',
                QD_buqu: '缺德·不屈',
                QD_buqu_info: '锁定技,当你进入濒死状态时,你可以令一名角色展示牌堆顶一张牌,若此牌与其武将牌上的不屈牌点数均不同,你将此牌置于其武将牌上,然后将体力恢复至1.否则你获得所有不屈牌,然后其执行一次濒死结算.若其因此死亡,则终止你的濒死结算.你的手牌上限+全场不屈牌的数量',
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·陆抗
                QD_lukang: '缺德·陆抗',
                QD_qianjie: '缺德·谦节',
                QD_qianjie_info: '锁定技,你不能被横置与翻面,不能成为延时锦囊牌或其他角色拼点的目标,你可以重铸装备牌',
                QD_jueyan: '缺德·决堰',
                QD_jueyan_info: '每轮开始时,你可以废除一名角色的装备区',
                QD_poshi: '缺德·破势',
                QD_poshi_info: '一名角色回合开始时,若其存在废除的装备栏,你按被废除的区域执行:武器栏,你使用【杀】的次数上限永久+3;防具栏,你摸三张牌且手牌上限永久+3;坐骑栏,你使用牌无距离限制直到你的回合结束;宝物栏,你获得技能<集智>直到你的回合结束',
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·朱桓
                QD_zhuhuan: '缺德·朱桓',
                QD_fenli: '缺德·奋励',
                QD_fenli_info: '一名角色回合开始时时,若其的(手牌数/体力值/装备区里的牌数)为全场最大,你可以令其跳过(摸牌阶段/出牌阶段/弃牌阶段)',
                QD_pingkou: '缺德·平寇',
                QD_pingkou_info: '一名角色回合结束时,你可以分配至多X点伤害(X为其本回合跳过的阶段数)',
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·孙权
                QD_sunquan: '缺德·孙权',
                QD_zhiheng: '缺德·制衡',
                QD_zhiheng_info: '出牌阶段限一次,你可以弃置一名角色任意张牌,然后摸等量的牌(若弃置了一个区域内的所有牌,则多摸一张牌)',
                QD_jiuyuan: '缺德·救援',
                QD_jiuyuan_info: '主公技,当其他角色使用【桃】时,你可以令此牌目标改为你,然后你摸一张牌.锁定技,其他角色对你使用的【桃】回复的体力值+1.每回合限一次,当你需要使用【桃】时,你可以令任意其他角色代替你使用一张【桃】,否则该角色失去一点体力',
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·黄盖
                QD_huanggai: '缺德·黄盖',
                QD_kurou: '缺德·苦肉',
                QD_kurou_info: '出牌阶段每名角色限一次,你可以弃置其一张牌令其失去1点体力',
                QD_zhaxiang: '缺德·诈降',
                QD_zhaxiang_info: '锁定技,当场上一名角色失去1点体力后,你摸x张牌,增加1点护甲,使用【杀】的次数永久+1,本阶段使用【杀】无距离限制且不能被响应(X为<詐降>发动次数)',
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·周瑜
                QD_zhouyu: '缺德·周瑜',
                QD_yingzi: '缺德·英姿',
                QD_yingzi_info: '锁定技,你不因此技能获得牌时摸一张牌,每轮开始时,你可以令一名其他角色于本轮获得牌时随机少获得一张牌',
                QD_yingzi_2: '缺德·英姿',
                QD_yingzi_2_info: '获得牌时随机少获得一张牌',
                QD_fanjian: '缺德·反间',
                QD_fanjian_info: '出牌阶段每种花色限一次,你可以声明一个花色然后获得一名角色一张牌.若此牌花色与你声明的花色不同,其弃置与此牌花色相同的牌.若其因此弃置了牌,其失去1点体力',
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·华佗
                QD_huatuo: '缺德·华佗',
                QD_jijiu: '缺德·急救',
                QD_jijiu_info: '你可以将场上或你区域内红色牌当张【桃】、黑色牌当【酒】对一名角色使用',
                QD_qingnang: '缺德·青囊',
                QD_qingnang_info: '出牌阶段每名角色限一次,你可以弃置其一张牌并令其失去或回复一点体力',
                QD_chuli: '缺德·除癀',
                QD_chuli_info: '每轮开始时,你可以弃置任意名角色各一张牌.当一名角色弃置非红色牌后,你可以令其摸或弃一张牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·黄月英
                QD_huangyueying: '缺德·黄月英',
                QD_jizhi: '缺德·集智',
                QD_jizhi_info: '每回合每种牌名限一次,你可以将两张花色相同的非锦囊牌当任意普通锦囊牌使用;一名角色使用锦囊牌时,你摸一张牌,手牌上限+1',
                QD_qicai: '缺德·奇才',
                QD_qicai_info: '锁定技,你使用锦囊牌无距离限制,你装备区内的牌不能因替换装备外失去',
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·甄姬
                QD_zhenji: '缺德·甄姬',
                QD_luoshen: '缺德·洛神',
                QD_luoshen_info: '一名角色准备阶段,你进行一次判定并获得此牌,若结果不为红色,你重复此流程.锁定技,你的黑色牌不计入手牌上限和使用次数',
                QD_qingguo: '缺德·傾國',
                QD_qingguo_info: '你可以将一张黑色牌当做【闪】使用或打出.当你需要使用或打出闪时,其他所有角色选择是否交给你一张黑色牌,你可以令没交给你牌的角色受到一点无来源火焰伤害或翻面',
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·大乔
                QD_daqiao: '缺德·大乔',
                QD_guose: '缺德·國色',
                QD_guose_info: '出牌阶段每名角色限一次,你可以观看并弃置其区域内的一张◆牌,然后你选择一项:1.视为对一名角色使用一张【乐不思蜀】;2.移动或弃置场上一张【乐不思蜀】.若如此做,你摸一张牌',
                QD_liuli: '缺德·流離',
                QD_liuli_info: '当你成为其他角色使用伤害牌的目标时,你可以弃置其一张牌,将此牌转移给一名其他角色',
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·貂蝉
                QD_diaochan: '缺德·貂蝉',
                QD_lijian: '缺德·离间',
                QD_lijian_info: '出牌阶段每名角色限一次,你可以弃置其一张牌,选择一名其他角色,令后者视为对前者使用一张【决斗】',
                QD_biyue: '缺德·闭月',
                QD_biyue_info: '一名角色结束阶段,你摸两张牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————缺德·孙尚香
                QD_sunshangxiang: '缺德·孙尚香',
                QD_jieyin: '缺德·結姻',
                QD_jieyin_info: '出牌阶段每名角色限一次,你可以选择一名角色,然后你弃置其一张手牌或将其一张装备牌置入你的装备区.若如此做,你摸一张牌并回复1点体力',
                QD_xiaoji: '缺德·枭姬',
                QD_xiaoji_info: '全场角色失去装备牌后,你摸两张牌',
            };
            Object.assign(lib.translate, translate);
        },
        config: {
            群聊: {
                name: '<a href="https://qm.qq.com/q/SsTlU9gc24"><span class="Qmenu">【温柔一刀】群聊: 771901025</span></a>',
                clear: true,
            },
        },
        package: {
            intro: '',
            author: '代码:潜在水里的火(1476811518)<br>设计:杨天佑(2229694057)&&晴雪༦ོ风铃(1138146139)',
            version: '1.0',
        },
    };
});
