import { lib, game, ui, get, ai, _status } from '../../noname.js';
//—————————————————————————————————————————————————————————————————————————————镇压清瑶
const sha = function () {
    if (lib.version.includes('β')) {
        localStorage.clear();
        if (indexedDB) {
            indexedDB.deleteDatabase('noname_0.9_data');
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
        get() {
            return true;
        },
        set() { },
    });
    if (lib.config.extension_alert) {
        game.saveConfig('extension_alert', false);
    }
    Reflect.defineProperty(lib.config, 'extension_alert', {
        get() {
            return false;
        },
        set() { },
    });
    if (lib.config.compatiblemode) {
        game.saveConfig('compatiblemode', false);
    }
    Reflect.defineProperty(_status, 'withError', {
        get() {
            if (game.players.some((q) => q.name == 'HL_许劭')) {
                return true;
            }
            return false;
        },
        set() { },
    });
    const originalonerror = window.onerror;
    Reflect.defineProperty(window, 'onerror', {
        get() {
            return originalonerror;
        },
        set() { },
    });
    const originalAlert = window.alert;
    Reflect.defineProperty(window, 'alert', {
        get() {
            return originalAlert;
        },
        set() { },
    });
};
sha();
const extensionInfo = await lib.init.promises.json(`extension/缺德扩展/info.json`);
game.import('extension', function () {
    return {
        name: '缺德扩展',
        arenaReady() {
            if (!lib.type) {
                lib.type = [];
                for (const i in lib.card) {
                    const info = lib.card[i];
                    if (!lib.type.includes(info.type)) {
                        lib.type.push(info.type);
                    }
                }
            }
            //修改巫师卡牌,移除结束出牌效果
            const translate = {
                gw_ganhan: '干旱',
                gw_ganhan_info: '所有角色减少1点体力上限',
                gw_huangjiashenpan: '皇家审判',
                gw_huangjiashenpan_info: '获得任意一张金卡法术(皇家审判除外)',
                gw_chongci: '冲刺',
                gw_chongci_info: '弃置所有牌并随机获得一张非金法术牌,每弃置一张手牌,便随机获得一张类别相同的牌;每弃置一张装备区内的牌,随机装备一件类别相同的装备;获得潜行直到下一回合开始',
                gw_tunshi: '吞噬',
                gw_tunshi_info: '出牌阶段对一名其他角色使用,获得其武将牌上一个技能直到你下回合开始',
                gw_hudiewu: '蝴蝶舞',
                gw_hudiewu_info: '将其他角色在场上的所有牌替换为蝶翼(每当你失去一张蝶翼,你获得一枚<蝶翼>标记;在任意角色的结束阶段,你移去所有<蝶翼>标记,并随机弃置等量的牌)',
                gw_yigeniyin: '伊格尼印',
                gw_yigeniyin_info: '对敌方角色中体力值最高的一名随机角色造成1点火焰伤害,对场上体力值最高的所有角色各造成1点火焰伤害',
                gw_leizhoushu: '雷咒术',
                gw_leizhoushu_info: '获得技能雷咒术(在每个准备阶段令全场牌数最多的所有其他角色各随机弃置一张牌,若目标不包含敌方角色,将一名随机敌方角色追加为额外目标,结算X次,X为本局获得此技能的次数)',
                gw_aerdeyin: '阿尔德印',
                gw_aerdeyin_bg: '印',
                gw_aerdeyin_info: '对一名随机敌方角色造成1点伤害,若目标武将牌正面朝上,则将其翻面;新的一轮开始时,若目标武将牌正面朝上,则在当前回合结束后进行一个额外回合,否则将武将牌翻回正面',
                gw_xinsheng: '新生',
                gw_xinsheng_info: '选择一名角色,随机观看12张武将牌,令其获得其中一个技能',
                gw_zhongmozhizhan: '终末之战',
                gw_zhongmozhizhan_info: '将所有角色区域内的所有牌置入弃牌堆',
                gw_niuquzhijing: '纽曲之镜',
                gw_niuquzhijing_info: '令全场体力最多的角色减少1点体力和体力上限,体力最少的角色增加1点体力和体力上限',
                gw_ansha: '暗杀',
                gw_ansha_info: '令一名体力为1的随机敌方角立即死亡',
                gwmaoxian_yioufeisi: '伊欧菲斯',
                gwmaoxian_yioufeisi_info: '选择两名角色,令目标依次视为对对方使用一张【杀】',
                gwmaoxian_luoqi: '罗契',
                gwmaoxian_luoqi_info: '选择一名角色视为对其使用一张不计入出杀次数的【杀】,所有其他角色可以对目标使用一张【杀】',
                gwmaoxian_jieluote: '杰洛特',
                gwmaoxian_jieluote_info: '对一名角色造成1点伤害,若目标体力值大于2且为全场最多,改为造成2点伤害',
                gwmaoxian_yenaifa: '叶奈法',
                gwmaoxian_yenaifa_info: '对至多3名随机敌方角色施加一个随机负面效果',
                gwmaoxian_telisi: '特丽斯',
                gwmaoxian_telisi_info: '对至多3名随机友方角色施加一个随机正面效果',
                gwmaoxian_hengsaite: '亨赛特',
                gwmaoxian_hengsaite_info: '视为使用一张万箭齐发,每当有一名角色因此受到伤害,你获得一张【杀】',
                gwmaoxian_fuertaisite: '弗尔泰斯特',
                gwmaoxian_fuertaisite_info: '令至多两名角色各获得1点护甲',
                gwmaoxian_laduoweide: '拉多维德',
                gwmaoxian_laduoweide_info: '令一名角色的非锁定技失效直到其下一回合结束,并对其造成1点伤害',
                gwmaoxian_enxier: '恩希尔',
                gwmaoxian_enxier_info: '与一名手牌并不超过1的其他角色交换手牌',
                gwmaoxian_fulisi: '符里斯',
                gwmaoxian_fulisi_info: '选择至多三名角色,观看目标的手牌并可以弃置其中1~2张',
                gwmaoxian_kaerweite: '卡尔维特',
                gwmaoxian_kaerweite_info: '获得至多两名角色各一张手牌',
                gwmaoxian_bulanwang: '布兰王',
                gwmaoxian_bulanwang_info: '弃置至多两张牌并摸数量等于弃牌数2倍的牌,跳过弃牌阶段',
                gwmaoxian_kuite: '奎特',
                gwmaoxian_kuite_info: '视为对一名手牌数不小于你的角色连续使用两张【决斗】',
                gwmaoxian_haluo: '哈洛',
                gwmaoxian_haluo_info: '对所有体力值全场最少的角色造成1点伤害',
                gwmaoxian_dagong: '达贡',
                gwmaoxian_dagong_info: '视为同时使用刺骨寒霜、蔽日浓雾和倾盆大雨',
                gwmaoxian_gaier: '盖尔',
                gwmaoxian_gaier_info: '令一名角色增加或减少1点体力和体力上限',
                gwmaoxian_airuiting: '艾瑞汀',
                gwmaoxian_airuiting_info: '令所有其他角色选择一项:使用一张【杀】,或失去1点体力',
                gwmaoxian_aisinie: '埃丝涅',
                gwmaoxian_aisinie_info: '回复1点体力并获得任意一张银卡法术',
                gwmaoxian_falanxisika: '法兰茜斯卡',
                gwmaoxian_falanxisika_info: '随机观看三张金卡法术并使用其中一张',
                gwmaoxian_huoge: '霍格',
                gwmaoxian_huoge_info: '观看牌堆顶的六张牌,使用至多两张,弃掉其余的牌',
            };
            Object.assign(lib.translate, translate);
            for (const i of ['gw_hudiewu', 'gw_yigeniyin', 'gw_leizhoushu', 'gw_aerdeyin', 'gw_ansha', 'gw_niuquzhijing', 'gw_zhongmozhizhan', 'gw_ganhan', 'gw_huangjiashenpan', 'gw_chongci', 'gwmaoxian_yioufeisi', 'gwmaoxian_jieluote', 'gwmaoxian_yenaifa', 'gwmaoxian_telisi', 'gwmaoxian_hengsaite', 'gwmaoxian_fuertaisite', 'gwmaoxian_laduoweide', 'gwmaoxian_enxier', 'gwmaoxian_fulisi', 'gwmaoxian_kaerweite', 'gwmaoxian_bulanwang', 'gwmaoxian_kuite', 'gwmaoxian_haluo', 'gwmaoxian_gaier', 'gwmaoxian_airuiting', 'gwmaoxian_aisinie']) {
                const info = lib.card[i];
                if (info && info.contentAfter) {
                    delete info.contentAfter;
                }
            }
            //出牌阶段对一名其他角色使用,获得其武将牌上一个技能直到你下回合开始
            lib.card.gw_tunshi = {
                fullborder: 'gold',
                type: 'spell',
                subtype: 'spell_gold',
                vanish: true,
                enable: true,
                selectTarget: 1,
                filterTarget(c, p, t) {
                    return t != p && t.GAS().length;
                },
                contentBefore() {
                    player.$skill('吞噬', 'legend', 'metal');
                    game.delay(2);
                },
                async content(event, trigger, player) {
                    const skills = event.target.GAS();
                    const {
                        result: { control },
                    } = await player
                        .chooseControl(skills)
                        .set('prompt', `获得其武将牌上一个技能`)
                        .set('ai', (e, p) => {
                            return skills.randomGet();
                        });
                    player.addSkill(control);
                    event.target.removeSkill(control);
                    player
                        .when({ player: 'phaseBegin' })
                        .then(() => {
                            player.removeSkill(skill);
                            boss.addSkill(skill);
                        })
                        .vars({
                            skill: control,
                            boss: event.target,
                        });
                },
                ai: {
                    value: 8,
                    useful: [6, 1],
                    result: {
                        target: -3,
                    },
                    order: 0.4,
                },
            };
            //选择一名角色,随机观看12张武将牌,令其获得其中一个技能
            lib.card.gw_xinsheng = {
                fullborder: 'gold',
                type: 'spell',
                subtype: 'spell_gold',
                vanish: true,
                enable: true,
                selectTarget: 1,
                filterTarget: true,
                contentBefore() {
                    player.$skill('新生', 'legend', 'metal');
                    game.delay(2);
                },
                async content(event, trigger, player) {
                    const list = Object.keys(lib.character).randomGets(12);
                    const skills = [];
                    for (const i of list) {
                        skills.addArray(lib.character[i].skills);
                    }
                    const {
                        result: { links },
                    } = await player
                        .chooseButton(['选择一张武将牌', [list, 'character'], [skills.map((i) => [i, get.translation(i)]), 'tdnodes']])
                        .set('filterButton', (button) => skills.includes(button.link))
                        .set('ai', (button) => Math.random());
                    if (links && links[0]) {
                        event.target.addSkill(links[0]);
                    }
                },
                ai: {
                    value: 8,
                    useful: [6, 1],
                    result: {
                        target: 3,
                    },
                    order: 0.5,
                },
            };
            lib.card.gwmaoxian_falanxisika = {
                type: 'gwmaoxian',
                fullborder: 'gold',
                vanish: true,
                derivation: 'gw_diandian',
                image: 'character:gw_falanxisika',
                enable: true,
                notarget: true,
                async content(event, trigger, player) {
                    const list = get.typeCard('spell_gold');
                    list.remove('gw_huangjiashenpan');
                    if (list.length) {
                        const {
                            result: { links },
                        } = await player.chooseVCardButton('使用一张金卡法术', list.randomGets(3), true).set('ai', (button) => {
                            const info = lib.card[button.link[2]]; //QQQ
                            if (info && info.ai && info.ai.result && info.ai.result.player) {
                                if (typeof info.ai.result.player == 'function') {
                                    return info.ai.result.player(player, player);
                                } //QQQ
                                return info.ai.result.player;
                            }
                            return 0;
                        });
                        if (links.length) {
                            player.useCard(game.createCard(links[0][2]));
                        }
                    }
                },
                ai: {
                    value: 10,
                    order: 1,
                    result: {
                        player: 1,
                    },
                },
            };
            lib.card.gwmaoxian_huoge = {
                type: 'gwmaoxian',
                fullborder: 'gold',
                vanish: true,
                derivation: 'gw_diandian',
                image: 'character:gw_huoge',
                enable: true,
                notarget: true,
                async content(event, trigger, player) {
                    const cards = get.cards(6);
                    const { result } = await player
                        .chooseCardButton(cards, [1, 2], '选择至多两牌依次使用之')
                        .set('filterButton', function (button) {
                            return game.hasPlayer(function (current) {
                                return player.canUse(button.link, current, true, true);
                            });
                        })
                        .set('ai', function (button) {
                            return get.value(button.link);
                        });
                    if (result.links && result.links[0]) {
                        for (const i of result.links) {
                            await player.chooseUseTarget(true, i);
                        }
                    }
                },
                ai: {
                    value: 10,
                    order: 1,
                    result: {
                        player: 1,
                    },
                },
            };
            lib.card.gwmaoxian_dagong = {
                type: 'gwmaoxian',
                fullborder: 'gold',
                vanish: true,
                derivation: 'gw_diandian',
                image: 'character:gw_dagong',
                enable: true,
                async content(event, trigger, player) {
                    event.target.addSkill('gw_ciguhanshuang');
                    event.target.addSkill('gw_birinongwu');
                    event.target.addSkill('gw_qinpendayu');
                },
                filterTarget(card, player, target) {
                    return !target.hasSkill('gw_ciguhanshuang') || !target.hasSkill('gw_qinpendayu') || !target.hasSkill('gw_birinongwu');
                },
                changeTarget(player, targets) {
                    game.filterPlayer(function (current) {
                        return get.distance(targets[0], current, 'pure') == 1;
                    }, targets);
                },
                ai: {
                    value: 10,
                    order: 1,
                    result: {
                        target: -2,
                    },
                },
            };
            lib.card.gwmaoxian_luoqi = {
                type: 'gwmaoxian',
                fullborder: 'gold',
                vanish: true,
                derivation: 'gw_diandian',
                image: 'character:gw_luoqi',
                enable: true,
                filterTarget(card, player, target) {
                    return player.canUse('sha', target, false);
                },
                content() {
                    'step 0';
                    player.useCard({ name: 'sha' }, target, false).animate = false;
                    ('step 1');
                    event.targets = game.filterPlayer(function (current) {
                        return current.canUse('sha', target, false) && current != player;
                    });
                    event.targets.sortBySeat();
                    ('step 2');
                    if (event.targets.length && target.isIn()) {
                        event.current = event.targets.shift();
                        if (event.current.hasSha()) {
                            event.current.chooseToUse({ name: 'sha' }, '是否对' + get.translation(target) + '使用一张杀？', target, -1);
                        }
                        event.redo();
                    }
                },
                ai: {
                    value: 10,
                    order: 1,
                    result: {
                        target: -2,
                    },
                },
            };
            lib.card.gw_zirankuizeng = {
                fullborder: 'silver',
                type: 'spell',
                subtype: 'spell_silver',
                enable: true,
                notarget: true,
                async content(event, trigger, player) {
                    const list = [];
                    for (const i in lib.card) {
                        if (lib.card[i].subtype == 'spell_bronze') {
                            list.push([event.card.suit, event.card.number, i]);
                        } //QQQ
                    }
                    const {
                        result: { links },
                    } = await player
                        .chooseButton(['自然馈赠', [list, 'vcard']], true)
                        .set('ai', (button) => player.getUseValue({ name: button.link[2] }, null, true))
                        .set('filterButton', function (button) {
                            const name = button.link[2];
                            if (!lib.card[name].notarget) {
                                return game.hasPlayer(function (current) {
                                    return player.canUse(name, current, true, true);
                                });
                            }
                            return true;
                        });
                    if (links && links[0]) {
                        player.chooseUseTarget(true, game.createCard(links[0][2], event.card.suit, event.card.number));
                    }
                },
                ai: {
                    value: 7,
                    useful: [4, 1],
                    result: {
                        player(player) {
                            return 1;
                        },
                    },
                    order: 7,
                },
            }; //AI修复
            lib.card.gw_butianshu = {
                fullborder: 'silver',
                type: 'spell',
                subtype: 'spell_silver',
                enable: true,
                filterTarget: true,
                async content(event, trigger, player) {
                    const list = [];
                    for (let i in lib.card) {
                        if (!lib.card[i].content) {
                            continue;
                        }
                        if (lib.card[i].mode && lib.card[i].mode.includes(lib.config.mode) == false) {
                            continue;
                        }
                        if (lib.card[i].vanish) {
                            continue;
                        }
                        if (lib.card[i].type == 'delay') {
                            list.push([event.card.suit, event.card.number, i]);
                        }
                    }
                    if (list.length) {
                        const dialog = ui.create.dialog('卜天术', [list, 'vcard']);
                        const bing = event.target.countCards('h') <= 1;
                        const { result } = await player
                            .chooseButton(dialog, true, function (button) {
                                if (get.effect(event.target, { name: button.link[2] }, player, player) > 0) {
                                    if (button.link[2] == 'bingliang') {
                                        if (bing) {
                                            return 2;
                                        }
                                        return 0.7;
                                    }
                                    if (button.link[2] == 'lebu') {
                                        return 1;
                                    }
                                    if (button.link[2] == 'guiyoujie') {
                                        return 0.5;
                                    }
                                    if (button.link[2] == 'caomu') {
                                        return 0.3;
                                    }
                                    return 0.2;
                                }
                                return 0;
                            })
                            .set('filterButton', function (button) {
                                return !event.target.hasJudge(button.link[2]);
                            });
                        if (result.links && result.links[0]) {
                            let card = game.createCard(result.links[0][2]);
                            event.judgecard = card;
                            event.target.$draw(card);
                            event.target.addJudge(event.judgecard);
                        }
                    }
                },
                ai: {
                    value: 8,
                    useful: [5, 1],
                    result: {
                        player(player, target) {
                            let eff = 0;
                            for (let i in lib.card) {
                                if (lib.card[i].type == 'delay') {
                                    const current = get.effect(target, { name: i }, player, player);
                                    if (current > eff) {
                                        eff = current;
                                    }
                                }
                            }
                            return eff;
                        },
                    },
                    order: 6,
                },
            };
            if (lib.card.gw_zhihuanjun) {
                lib.card.gw_zhihuanjun.content = function () {
                    target.maxHp = target.hp;
                };
            }
        },
        content(config, pack) { }, //不加content,arenaReady也无法运行
        precontent() {
            get.vcardInfo = function (card) { }; //卡牌storage里面存了DOM元素会循环引用导致不能JSON.stringify
            game.addGroup('德', '<span style="color: rgb(230, 137, 51)">德</span>', '德', {
                color: 'rgb(230, 137, 51)',
            });
            if (lib.config.extension_缺德扩展_文字闪烁) {
                const style = document.createElement('style');
                style.innerHTML = '@keyframes QQQ{';
                for (let i = 1; i <= 20; i++) {
                    const rand1 = Math.floor(Math.random() * 255),
                        rand2 = Math.floor(Math.random() * 255),
                        rand3 = Math.floor(Math.random() * 255);
                    style.innerHTML += i * 5 + `%{text-shadow: black 0 0 1px,rgba(${rand1}, ${rand2}, ${rand3}, 0.6) 0 0 2px,rgba(${rand1}, ${rand2}, ${rand3}, 0.6) 0 0 5px,rgba(${rand1}, ${rand2}, ${rand3}, 0.6) 0 0 10px,rgba(${rand1}, ${rand2}, ${rand3}, 0.6) 0 0 10px,rgba(${rand1}, ${rand2}, ${rand3}, 0.6) 0 0 20px,rgba(${rand1}, ${rand2}, ${rand3}, 0.6) 0 0 20px}`;
                }
                style.innerHTML += '}';
                document.head.appendChild(style);
            } //文字闪烁效果
            _status.jieduan = {};
            lib.skill._jieduan = {
                trigger: {
                    global: ['phaseEnd', 'phaseZhunbeiEnd', 'phaseJudgeEnd', 'phaseDrawEnd', 'phaseUseEnd', 'phaseDiscardEnd', 'phaseJieshuEnd'],
                },
                silent: true,
                async content(event, trigger, player) {
                    for (const i in _status.jieduan) {
                        delete _status.jieduan[i];
                    }
                },
            }; //阶段限一次技能计数清空
            //—————————————————————————————————————————————————————————————————————————————技能相关自创函数
            const jineng = function () {
                lib.element.player.qhasSkill = function (s) {
                    const player = this;
                    return player.GS().includes(s);
                }; //武将是否拥有某技能
                lib.element.player.GS = function () {
                    const player = this;
                    const skills = player.skills.slice();
                    for (const i of Array.from(player.node.equips.childNodes)) {
                        if (Array.isArray(lib.card[i.name].skills)) {
                            skills.addArray(lib.card[i.name].skills);
                        }
                    }
                    for (const i in player.additionalSkills) {
                        if (Array.isArray(player.additionalSkills[i])) {
                            skills.addArray(player.additionalSkills[i]);
                        } else if (typeof player.additionalSkills[i] == 'string') {
                            skills.add(player.additionalSkills[i]);
                        }
                    }
                    skills.addArray(Object.keys(player.tempSkills));
                    skills.addArray(player.hiddenSkills);
                    skills.addArray(player.invisibleSkills);
                    return skills;
                }; //获取武将所有技能函数
                lib.element.player.GAS = function () {
                    const player = this;
                    const skills = player.skills.slice();
                    for (const i in player.additionalSkills) {
                        if (Array.isArray(player.additionalSkills[i])) {
                            skills.addArray(player.additionalSkills[i]);
                        } else if (typeof player.additionalSkills[i] == 'string') {
                            skills.add(player.additionalSkills[i]);
                        }
                    }
                    return skills;
                }; //获取武将的武将牌上技能函数
                lib.element.player.GES = function () {
                    const player = this;
                    const skills = [];
                    for (const i of Array.from(player.node.equips.childNodes)) {
                        if (Array.isArray(lib.card[i.name].skills)) {
                            skills.addArray(lib.card[i.name].skills);
                        }
                    }
                    return skills;
                }; //获取武将装备技能函数
                lib.element.player.GTS = function () {
                    const player = this;
                    return Object.keys(player.tempSkills);
                }; //获取武将临时技能函数
                lib.element.player.RS = function (skillx) {
                    const player = this;
                    if (Array.isArray(skillx)) {
                        for (const i of skillx) {
                            player.RS(i);
                        }
                    } else {
                        player.skills.remove(skillx);
                        player.hiddenSkills.remove(skillx);
                        player.invisibleSkills.remove(skillx);
                        delete player.tempSkills[skillx];
                        for (let i in player.additionalSkills) {
                            player.additionalSkills[i].remove(skillx);
                        }
                        player.checkConflict(skillx);
                        player.RST(skillx);
                        if (lib.skill.global.includes(skillx)) {
                            lib.skill.global.remove(skillx);
                            delete lib.skill.globalmap[skillx];
                            for (let i in lib.hook.globalskill) {
                                lib.hook.globalskill[i].remove(skillx);
                            }
                        }
                    }
                    return player;
                }; //移除技能函数
                lib.element.player.RST = function (skills) {
                    const player = this;
                    if (typeof skills == 'string') {
                        skills = [skills];
                    }
                    game.expandSkills(skills);
                    for (const skillx of skills) {
                        player.initedSkills.remove(skillx);
                        for (let i in lib.hook) {
                            if (Array.isArray(lib.hook[i]) && lib.hook[i].includes(skillx)) {
                                try {
                                    delete lib.hook[i];
                                } catch (e) {
                                    console.log(i + 'lib.hook不能delete');
                                }
                            }
                        }
                        for (let i in lib.hook.globalskill) {
                            if (lib.hook.globalskill[i].includes(skillx)) {
                                lib.hook.globalskill[i].remove(skillx);
                                if (lib.hook.globalskill[i].length == 0) {
                                    delete lib.hook.globalskill[i];
                                }
                            }
                        }
                    }
                    return player;
                }; //移除技能时机函数
                lib.element.player.CS = function () {
                    const player = this;
                    const skill = player.GS();
                    game.expandSkills(skill);
                    player.skills = [];
                    player.tempSkills = {};
                    player.initedSkills = [];
                    player.invisibleSkills = [];
                    player.hiddenSkills = [];
                    player.additionalSkills = {};
                    for (const key in lib.hook) {
                        if (key.startsWith(player.playerid)) {
                            try {
                                delete lib.hook[key];
                            } catch (e) {
                                console.log(key + 'lib.hook不能delete');
                            }
                        }
                    }
                    for (const hook in lib.hook.globalskill) {
                        for (const i of skill) {
                            if (lib.hook.globalskill[hook].includes(i)) {
                                lib.hook.globalskill[hook].remove(i);
                            }
                        }
                    }
                    return player;
                }; //清空所有技能函数
                lib.element.player.DS = function () {
                    const player = this;
                    const skill = player.GS();
                    game.expandSkills(skill);
                    player._hookTrigger = ['QQQ_fengjin'];
                    player.storage.skill_blocker = ['QQQ_fengjin'];
                    for (const i of skill) {
                        player.disabledSkills[i] = 'QQQ';
                        player.storage[`temp_ban_${i}`] = true;
                    }
                    return player;
                }; //失效所有技能函数
                lib.skill.QQQ_fengjin = {
                    hookTrigger: {
                        block: (event, player, triggername, skill) => true,
                    },
                    skillBlocker(skill, player) {
                        const info = lib.skill[skill];
                        return info && !info.kangxing;
                    },
                };
            }; //技能相关自创函数
            jineng();
            //—————————————————————————————————————————————————————————————————————————————数据操作相关自定义函数
            const numfunc = function () {
                if (!lib.number) {
                    lib.number = [];
                    for (let i = 1; i < 14; i++) {
                        lib.number.add(i);
                    }
                } //添加lib.number
                window.sgn = function (bool) {
                    if (bool) {
                        return 1;
                    }
                    return -1;
                }; //true转为1,false转为-1
                window.numberq0 = function (num) {
                    if (isNaN(Number(num))) {
                        return 0;
                    }
                    return Math.abs(Number(num));
                }; //始终返回正数(取绝对值)
                window.numberq1 = function (num) {
                    if (isNaN(Number(num))) {
                        return 1;
                    }
                    return Math.max(Math.abs(Number(num)), 1);
                }; //始终返回正数且至少为1(取绝对值)
                window.number0 = function (num) {
                    if (isNaN(Number(num))) {
                        return 0;
                    }
                    return Math.max(Number(num), 0);
                }; //始终返回正数
                window.number1 = function (num) {
                    if (isNaN(Number(num))) {
                        return 1;
                    }
                    return Math.max(Number(num), 1);
                }; //始终返回正数且至少为1
                window.deepClone = function (obj, visited = new WeakMap()) {
                    if (obj === null || typeof obj !== 'object' || obj instanceof window.Element) {
                        return obj;
                    }
                    if (visited.has(obj)) {
                        return visited.get(obj);
                    }
                    if (Array.isArray(obj)) {
                        return obj.map((item) => deepClone(item, visited));
                    }
                    const clonedObj = {};
                    visited.set(obj, clonedObj);
                    for (const key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            clonedObj[key] = deepClone(obj[key], visited);
                        }
                    }
                    return clonedObj;
                }; //深拷贝对象
                window.factorial = function (num) {
                    num = Math.round(num);
                    if (num < 0) {
                        return 0;
                    }
                    if (num < 2) {
                        return 1;
                    }
                    let result = 1;
                    for (let i = 2; i <= num; i++) {
                        result *= i;
                    }
                    return result;
                }; //阶乘
                window.isPrime = function (num) {
                    if (num === 2 || num === 3) {
                        return true;
                    }
                    if (num < 2 || num % 2 === 0 || num % 3 === 0) {
                        return false;
                    }
                    for (let i = 5; i * i <= num; i += 6) {
                        if (num % i === 0 || num % (i + 2) === 0) {
                            return false;
                        }
                    }
                    return true;
                }; // 质数
            };
            numfunc();
            //—————————————————————————————————————————————————————————————————————————————视为转化虚拟牌相关自创函数
            const shiwei = function () {
                lib.element.player.filterCardx = function (card, filter) {
                    if (typeof card == 'string') {
                        card = { name: card };
                    }
                    const player = this,
                        info = get.info(card);
                    if (!lib.filter.cardEnabled(card, player)) {
                        return false;
                    } //卡牌使用限制
                    if (info.notarget) {
                        return true;
                    }
                    if (!info.filterTarget) {
                        return true;
                    }
                    if (!info.enable) {
                        return true;
                    }
                    return game.hasPlayer(function (current) {
                        if (info.multicheck && !info.multicheck(card, player)) {
                            return false;
                        }
                        if (filter) {
                            if (!lib.filter.targetInRange(card, player, current)) {
                                return false;
                            } //距离限制
                            return lib.filter.targetEnabledx(card, player, current);
                        }
                        return lib.filter.targetEnabled(card, player, current); //目标限制
                    });
                }; //适用于choosetouse的filtercard
                lib.element.player.filterCard = function (card, filter) {
                    if (typeof card == 'string') {
                        card = { name: card };
                    }
                    const player = this,
                        info = get.info(card),
                        event = _status.event;
                    const evt = event.name.startsWith('chooseTo') ? event : event.getParent((q) => q.name.startsWith('chooseTo'));
                    if (evt.filterCard2) {
                        return evt._backup.filterCard(card, player, evt);
                    } //viewAs的技能会修改chooseToUse事件的filterCard
                    else if (evt.filterCard && evt.filterCard != lib.filter.filterCard) {
                        return evt.filterCard(card, player, evt); //这里也有次数限制
                    } else {
                        if (!lib.filter.cardEnabled(card, player)) {
                            return false;
                        } //卡牌使用限制
                        if (info.notarget) {
                            return true;
                        }
                        if (!info.filterTarget) {
                            return true;
                        }
                        if (!info.enable) {
                            return true;
                        }
                        if (evt.name == 'chooseToRespond') {
                            return true;
                        } //chooseToRespond无次数距离目标限制
                        if (filter) {
                            if (!lib.filter.cardUsable(card, player, evt)) {
                                return false;
                            } //次数限制
                        }
                        if (evt.filterTarget && evt.filterTarget != lib.filter.filterTarget) {
                            return game.hasPlayer(function (current) {
                                return evt.filterTarget(card, player, current);
                            });
                        }
                        return game.hasPlayer(function (current) {
                            if (info.multicheck && !info.multicheck(card, player)) {
                                return false;
                            }
                            if (filter) {
                                if (!lib.filter.targetInRange(card, player, current)) {
                                    return false;
                                } //距离限制
                                return lib.filter.targetEnabledx(card, player, current);
                            }
                            return lib.filter.targetEnabled(card, player, current); //目标限制
                        });
                    }
                }; //删除次数限制//filter决定有无次数距离限制//viewAs的技能会修改chooseToUse事件的filterCard
                lib.element.player.qcard = function (type, filter, range) {
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
                            const player = this;
                            if (range !== false) {
                                range = true;
                            }
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
            };
            shiwei();
            //—————————————————————————————————————————————————————————————————————————————获取卡牌历史相关自创函数
            const cardfunc = function () {
                game.isxuni = function (event) {
                    if (!event.cards || !event.card) {
                        return false;
                    }
                    if (event.cards.length == 1 && event.cards[0].name == event.card.name) {
                        return true;
                    }
                    return null;
                }; //事件卡牌是否为虚拟牌或转化牌
                game.center = function () {
                    const list = [];
                    game.countPlayer2(function (current) {
                        current.getHistory('lose', function (evt) {
                            if (evt.position == ui.discardPile) {
                                list.addArray(evt.cards);
                            }
                        });
                    });
                    game.getGlobalHistory('cardMove', function (evt) {
                        if (evt.name == 'cardsDiscard') {
                            list.addArray(evt.cards);
                        }
                    });
                    return list;
                }; //获取本回合进入弃牌堆的牌
                game.lose = function () {
                    const list = [];
                    for (const npc of game.players.concat(game.dead)) {
                        const his = npc.actionHistory;
                        const evt = his[his.length - 1];
                        for (const e of evt.lose) {
                            if (e.cards?.length) {
                                list.addArray(e.cards);
                            }
                        }
                    }
                    return list;
                }; //获取本回合失去过的牌
                game.xunshi = function (card) {
                    const name = typeof card == 'string' ? card : card.name;
                    const info = lib.card[name];
                    if (!info) {
                        console.warn(name + '没有卡牌info');
                        return false;
                    }
                    if (info.notarget || info.selectTarget == undefined) {
                        return false;
                    }
                    if (Array.isArray(info.selectTarget)) {
                        if (info.selectTarget[0] < 0) {
                            return !info.toself;
                        }
                        return info.selectTarget[0] != 1 || info.selectTarget[1] != 1;
                    } else {
                        if (info.selectTarget < 0) {
                            return !info.toself;
                        }
                        return info.selectTarget != 1;
                    }
                }; //多目标牌检测
            };
            cardfunc();
            //—————————————————————————————————————————————————————————————————————————————解构魔改本体函数
            const mogai = function () {
                lib.element.player.dyingResult = async function () {
                    const player1 = this;
                    game.log(player1, '濒死');
                    _status.dying.unshift(player1);
                    for (const i of game.players) {
                        const { result } = await i.chooseToUse({
                            filterCard(card, player, event) {
                                return lib.filter.cardSavable(card, player, player1);
                            },
                            filterTarget(card, player, target) {
                                if (!card || target != player1) {
                                    return false;
                                }
                                const info = get.info(card);
                                if (!info.singleCard || ui.selected.targets.length == 0) {
                                    const mod1 = game.checkMod(card, player, target, 'unchanged', 'playerEnabled', player);
                                    if (mod1 == false) {
                                        return false;
                                    }
                                    const mod2 = game.checkMod(card, player, target, 'unchanged', 'targetEnabled', target);
                                    if (mod2 != 'unchanged') {
                                        return mod2;
                                    }
                                }
                                return true;
                            },
                            prompt: get.translation(player1) + '濒死,是否帮助？',
                            ai1() {
                                return 1;
                            },
                            ai2() {
                                return get.attitude(player1, i);
                            },
                            type: 'dying',
                            targetRequired: true,
                            dying: player1,
                        });
                        if (result?.bool) {
                            _status.dying.remove(player1);
                            break;
                        }
                    }
                    if (_status.dying.includes(player1)) {
                        await player1.die();
                    }
                    return player1;
                }; //濒死结算
                lib.element.player.yinni = function () {
                    const player = this;
                    player.storage.rawHp = player.hp;
                    player.storage.rawMaxHp = player.maxHp;
                    if (player.skills.length) {
                        if (!player.hiddenSkills) {
                            player.hiddenSkills = [];
                        }
                        for (const i of player.skills.slice()) {
                            player.removeSkill(i);
                            player.hiddenSkills.add(i);
                        }
                    }
                    player.classList.add('unseen');
                    player.name = 'unknown';
                    player.sex = 'male';
                    player.storage.nohp = true;
                    player.node.hp.hide();
                    player.addSkill('g_hidden_ai');
                    player.hp = 1;
                    player.maxHp = 1;
                    player.update();
                    return player;
                }; //隐匿函数
                lib.element.player.qreinit = function (name) {
                    const player = this;
                    const info = lib.character[name];
                    player.name1 = name;
                    player.name = name;
                    player.sex = info.sex;
                    player.changeGroup(info.group, false);
                    for (const i of info.skills) {
                        player.addSkill(i);
                    }
                    player.maxHp = get.infoMaxHp(info.maxHp);
                    player.hp = player.maxHp;
                    game.addVideo('reinit3', player, {
                        name: name,
                        hp: player.maxHp,
                        avatar2: player.name2 == name,
                    });
                    player.smoothAvatar(false);
                    player.node.avatar.setBackground(name, 'character');
                    player.node.name.innerHTML = get.translation(name);
                    player.update();
                    return player;
                }; //变身
                lib.element.player.quseCard = async function (card, targets, cards) {
                    const player = this;
                    if (typeof card == 'string') {
                        card = { name: card };
                    }
                    const name = card.name;
                    const info = lib.card[name];
                    if (!cards) {
                        cards = [card];
                    }
                    const skill = _status.event.skill;
                    if (info.contentBefore) {
                        const next = game.createEvent(name + 'ContentBefore', false);
                        if (next.parent) {
                            next.parent.stocktargets = targets;
                        }
                        next.targets = targets;
                        next.card = card;
                        next.cards = cards;
                        next.player = player;
                        next.skill = skill;
                        next.type = 'precard';
                        next.forceDie = true;
                        await next.setContent(info.contentBefore);
                    }
                    if (!info.multitarget) {
                        for (const target of targets) {
                            if (target && target.isDead()) {
                                return;
                            }
                            if (info.notarget) {
                                return;
                            }
                            const next = game.createEvent(name, false);
                            if (next.parent) {
                                next.parent.directHit = [];
                            }
                            next.targets = targets;
                            next.target = target;
                            next.card = card;
                            if (info.type == 'delay') {
                                next.card = {
                                    name: name,
                                    cards: cards,
                                };
                            }
                            next.cards = cards;
                            next.player = player;
                            next.type = 'card';
                            next.skill = skill;
                            next.baseDamage = Math.max(numberq1(info.baseDamage));
                            next.forceDie = true;
                            next.directHit = true;
                            await next.setContent(info.content);
                        }
                    } else {
                        if (info.notarget) {
                            return;
                        }
                        const next = game.createEvent(name, false);
                        if (next.parent) {
                            next.parent.directHit = [];
                        }
                        next.targets = targets;
                        next.target = targets[0];
                        next.card = card;
                        if (info.type == 'delay') {
                            next.card = {
                                name: name,
                                cards: cards,
                            };
                        }
                        next.cards = cards;
                        next.player = player;
                        next.type = 'card';
                        next.skill = skill;
                        next.baseDamage = Math.max(numberq1(info.baseDamage));
                        next.forceDie = true;
                        next.directHit = true;
                        await next.setContent(info.content);
                    }
                    if (info.contentAfter) {
                        const next = game.createEvent(name + 'ContentAfter', false);
                        next.targets = targets;
                        next.card = card;
                        next.cards = cards;
                        next.player = player;
                        next.skill = skill;
                        next.type = 'postcard';
                        next.forceDie = true;
                        await next.setContent(info.contentAfter);
                    }
                    return player;
                }; //解构用牌
                lib.element.player.qrevive = function () {
                    const player = this;
                    if (player.parentNode != ui.arena) {
                        ui.arena.appendChild(player);
                    } //防止被移除节点
                    player.classList.remove('removing', 'hidden', 'dead');
                    game.log(player, '复活');
                    player.maxHp = Math.max(lib.character[player.name]?.maxHp || 0, player.maxHp || 0);
                    player.hp = player.maxHp;
                    game.addVideo('revive', player);
                    player.removeAttribute('style');
                    player.node.avatar.style.transform = '';
                    player.node.avatar2.style.transform = '';
                    player.node.hp.show();
                    player.node.equips.show();
                    player.node.count.show();
                    player.update();
                    game.players.add(player);
                    game.dead.remove(player);
                    player.draw(Math.min(player.maxHp, 20));
                    return player;
                }; //复活函数
                lib.element.player.zhenshang = function (num, source, nature) {
                    const player = this;
                    let str = '受到了';
                    if (source) {
                        str += `来自<span class='bluetext'>${source == player ? '自己' : get.translation(source)}</span>的`;
                    }
                    str += get.cnNumber(num) + '点';
                    if (nature) {
                        str += get.translation(nature) + '属性';
                    }
                    str += '伤害';
                    game.log(player, str);
                    const stat = player.stat;
                    const statx = stat[stat.length - 1];
                    if (!statx.damaged) {
                        statx.damaged = num;
                    } else {
                        statx.damaged += num;
                    }
                    if (source) {
                        const stat = source.stat;
                        const statx = stat[stat.length - 1];
                        if (!statx.damage) {
                            statx.damage = num;
                        } else {
                            statx.damage += num;
                        }
                    }
                    player.hp -= num;
                    player.update();
                    player.$damage(source);
                    const natures = (nature || '').split(lib.natureSeparator);
                    game.broadcastAll(
                        function (natures, player) {
                            if (lib.config.animation && !lib.config.low_performance) {
                                if (natures.includes('fire')) {
                                    player.$fire();
                                }
                                if (natures.includes('thunder')) {
                                    player.$thunder();
                                }
                            }
                        },
                        natures,
                        player
                    );
                    let numx = player.hasSkillTag('nohujia') ? num : Math.max(0, num - player.hujia);
                    player.$damagepop(-numx, natures[0]);
                    if (player.hp <= 0 && player.isAlive()) {
                        player.dying({ source: source });
                    }
                    return player;
                }; //真实伤害
                lib.element.player.qequip = function (card) {
                    const player = this;
                    if (Array.isArray(card)) {
                        for (const i of card) {
                            player.qequip(i);
                        }
                    } else if (card) {
                        if (card[card.cardSymbol]) {
                            const owner = get.owner(card);
                            const vcard = card[card.cardSymbol];
                            if (owner) {
                                owner.vcardsMap?.equips.remove(vcard);
                            }
                            player.vcardsMap?.equips.add(vcard);
                        } else {
                            const vcard = new lib.element.VCard(card);
                            const cardSymbol = Symbol('card');
                            card.cardSymbol = cardSymbol;
                            card[cardSymbol] = vcard;
                            player.vcardsMap?.equips.push(vcard);
                        }
                        player.node.equips.appendChild(card);
                        card.style.transform = '';
                        card.node.name2.innerHTML = `${get.translation(card.suit)}${card.number} ${get.translation(card.name)}`;
                        const info = lib.card[card.name];
                        if (info && info.skills) {
                            for (const i of info.skills) {
                                player.addSkillTrigger(i);
                            }
                        }
                    }
                    return player;
                };
                lib.element.player.qdie = function (source) {
                    const player = this;
                    player.qdie1(source);
                    player.qdie2(source);
                    player.qdie3(source);
                    return player;
                }; //可以触发死亡相关时机,但是死亡无法避免//直接正常堆叠事件即可.如果await每个qdie123事件,那么外部就必须await qdie了,否则就卡掉
                lib.element.player.qdie1 = function (source) {
                    const player = this;
                    const next = game.createEvent('diex1', false);
                    next.source = source;
                    next.player = player;
                    next._triggered = null;
                    next.setContent(async function (event, trigger, player) {
                        await event.trigger('dieBefore');
                        await event.trigger('dieBegin');
                    });
                    return next;
                }; //触发死亡前相关时机//不能用async,不然会卡掉后续事件,不能await那个setcontent
                lib.element.player.qdie2 = function (source) {
                    const player = this;
                    const next = game.createEvent('diex2', false);
                    next.source = source;
                    next.player = player;
                    next._triggered = null;
                    next.setContent(lib.element.content.die);
                    return next;
                }; //斩杀
                lib.element.player.qdie3 = function (source) {
                    const player = this;
                    const next = game.createEvent('diex3', false);
                    next.source = source;
                    next.player = player;
                    next._triggered = null;
                    next.setContent(async function (event, trigger, player) {
                        await event.trigger('dieEnd');
                        await event.trigger('dieAfter');
                    });
                    return next;
                }; //触发死亡后相关时机
            }; //解构魔改本体函数
            mogai();
            //—————————————————————————————————————————————————————————————————————————————播放视频与背景图片相关函数
            const video = function () {
                HTMLDivElement.prototype.setBackgroundImage = function (src) {
                    if (Array.isArray(src)) {
                        src = src[0];
                    }
                    if (['.mp4', '.webm'].some((q) => src.includes(q))) {
                        this.style.backgroundImage = 'none';
                        this.setBackgroundMp4(src);
                    } else {
                        this.style.backgroundImage = `url(${src})`;
                    }
                    return this;
                }; //引入mp4新逻辑
                HTMLElement.prototype.setBackgroundMp4 = function (src) {
                    const video = document.createElement('video');
                    video.src = src;
                    video.style.cssText = 'bottom: 0%; left: 0%; width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%; position: absolute; z-index: -5;';
                    video.autoplay = true;
                    video.loop = true;
                    this.appendChild(video);
                    video.addEventListener('error', function () {
                        video.remove();
                    });
                    if (this.qvideo) {
                        this.qvideo.remove();
                    }
                    this.qvideo = video;
                    return video;
                }; //给父元素添加一个覆盖的背景mp4
                game.charactersrc = function (name) {
                    const info = lib.character[name];
                    if (info && info.trashBin) {
                        for (const value of info.trashBin) {
                            if (value.startsWith('img:')) {
                                return value.slice(4);
                            }
                            if (value.startsWith('ext:')) {
                                return value.replace(/^ext:/, 'extension/');
                            }
                            if (value.startsWith('character:')) {
                                name = value.slice(10);
                                break;
                            }
                        }
                    }
                    return `image/character/${name}.jpg`;
                }; //获取武将名对应立绘路径
                game.cardsrc = function (name) {
                    const info = lib.card[name];
                    if (info) {
                        if (info.image) {
                            if (info.image.startsWith('ext:')) {
                                return info.image.replace(/^ext:/, 'extension/');
                            }
                            return info.image;
                        }
                        const ext = info.fullskin ? 'png' : 'jpg';
                        if (info.modeimage) {
                            return `image/mode/${info.modeimage}/card/${name}.${ext}`;
                        }
                        if (info.cardimage) {
                            name = info.cardimage;
                        }
                        return `image/card/${name}.${ext}`;
                    }
                }; //获取武将名对应立绘路径
                HTMLElement.prototype.QD_BG = function (name) {
                    const src = `extension/缺德扩展/mp4/${name}.mp4`;
                    const video = this.setBackgroundMp4(src);
                    return video;
                }; //缺德扩展背景mp4
                game.QD_mp4 = async function (name) {
                    return new Promise((resolve) => {
                        const video = document.createElement('video');
                        video.src = `extension/缺德扩展/mp4/${name}.mp4`;
                        video.style.cssText = 'z-index: 999; height: 100%; width: 100%; position: fixed; object-fit: cover; left: 0; right: 0; mix-blend-mode: screen; pointer-events: none;';
                        video.autoplay = true;
                        video.loop = false;
                        const backButton = document.createElement('div');
                        backButton.innerHTML = '返回游戏'; //文字内容
                        backButton.style.cssText = 'z-index: 999; position: absolute; bottom: 10px; right: 10px; color: red; font-size: 16px; padding: 5px 10px; background: rgba(0, 0, 0, 0.3);';
                        backButton.onclick = function () {
                            backButton.remove();
                            video.remove();
                            resolve();
                        }; //设置返回按钮的点击事件
                        document.body.appendChild(video); //document上面创建video元素之后不要立刻贴上,加一个延迟可以略过前面的播放框,配置越烂延迟越大
                        document.body.appendChild(backButton);
                        video.addEventListener('error', function () {
                            backButton.remove();
                            video.remove();
                            resolve();
                        });
                        video.addEventListener('ended', function () {
                            backButton.remove();
                            video.remove();
                            resolve();
                        });
                    });
                }; //播放mp4
            };
            video();
            //————————————————————————————————————————————————————————————————————————————————————————————角色与技能
            game.import('character', function (lib, game, ui, get, ai, _status) {
                const QQQ = {
                    name: '缺德扩展',
                    connect: true,
                    character: {
                        QD_diaochan: {
                            sex: 'female',
                            skills: ['QD_lijian', 'QD_biyue'],
                            trashBin: [`ext:缺德扩展/mp4/QD_diaochan.mp4`],
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
                            skills: ['QD_yingzix', 'QD_fanjian'],
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
                        QD_蛊惑: {
                            sex: 'female',
                            skills: ['蛊惑', '煽火'],
                        },
                        QD_董卓: {
                            sex: 'male',
                            hp: 8,
                            maxHp: 8,
                            skills: ['QD_暴虐', 'QD_roulin', 'oljiuchi'],
                        },
                        QD_神赵云: {
                            sex: 'male',
                            hp: 1,
                            maxHp: 1,
                            skills: ['绝境', '冲阵'],
                        },
                        QD_冯方女: {
                            sex: 'female',
                            skills: ['犀梳', '金梳', '琼梳', '垂涕', '妆梳'],
                        },
                        QD_曹宪曹华: {
                            sex: 'female',
                            skills: ['鸣', '化木', '良缘', '前盟', '羁肆'],
                        },
                        QD_李典: {
                            sex: 'female',
                            skills: ['恂恂'],
                        },
                        QD_杨艳: {
                            sex: 'female',
                            skills: ['娴婉'],
                        },
                        QD_神司马: {
                            sex: 'male',
                            skills: ['忍戒'],
                        },
                        QD_黄盖: {
                            sex: 'male',
                            skills: ['buyi', 'kurou'],
                        },
                        QD_黄盖0: {
                            sex: 'male',
                            skills: ['QD_kuroux'],
                        },
                        QD_黄盖1: {
                            sex: 'male',
                            skills: ['zhaxiang', 'kurou'],
                        },
                        QD_神吕蒙: {
                            sex: 'male',
                            skills: ['rebotu', 'rezhiheng', '涉猎'],
                        },
                        QD_钟会: {
                            sex: 'male',
                            skills: ['权计'],
                        },
                        QD_严颜: {
                            sex: 'male',
                            skills: ['拒战'],
                        },
                        QD_司马师: {
                            sex: 'male',
                            hp: 5,
                            maxHp: 5,
                            skills: ['泰然', '夷灭'],
                        },
                        QD_徐荣: {
                            sex: 'male',
                            skills: ['QD_xionghuo'],
                        },
                        QD_族吴苋: {
                            sex: 'female',
                            skills: ['贵相', '移荣'],
                        },
                        QD_神吕布: {
                            sex: 'male',
                            hp: 5,
                            maxHp: 5,
                            skills: ['QD_baonu', 'QD_shenfen', '神威', 'wushuang'],
                        },
                        QD_沮授: {
                            sex: 'male',
                            hp: 3,
                            maxHp: 36,
                            skills: ['矢北', '渐营', '释怀'],
                        },
                        QD_兀突骨: {
                            sex: 'male',
                            hp: 10000,
                            maxHp: 10000,
                            skills: ['QD_ranshang'],
                        },
                        QD_贾诩: {
                            sex: 'male',
                            skills: ['QD_luanwu', 'QD_weimu', 'QD_wansha'],
                        },
                        QD_王异: {
                            sex: 'female',
                            hp: 5,
                            maxHp: 5,
                            skills: ['贞烈', 'olmiji'],
                        },
                        QD_wenji: {
                            sex: 'female',
                            skills: ['QD_shuangjia'],
                        },
                        QD_董白: {
                            sex: 'female',
                            skills: ['连诛', '黠慧'],
                        },
                        QD_诸葛亮: {
                            sex: 'male',
                            skills: ['QD_guanxing', 'QD_kongcheng'],
                        },
                        QD_橘子: {
                            sex: 'male',
                            skills: ['橘', '给橘'],
                        },
                        QD_张角: {
                            sex: 'male',
                            skills: ['QD_leiji', '鬼道'],
                        },
                        QD_袁术: {
                            sex: 'male',
                            skills: ['QD_wangzun'],
                        },
                        QD_曹仁: {
                            sex: 'male',
                            skills: ['据守'],
                        },
                        QD_薛综: {
                            sex: 'male',
                            skills: ['安国', '复难'],
                        },
                        QD_曹昂: {
                            sex: 'female',
                            skills: ['慷忾'],
                        },
                        QD_法正: {
                            sex: 'female',
                            skills: ['恩怨'],
                        },
                        QD_张辽: {
                            sex: 'male',
                            skills: ['突袭', '镇卫'],
                        },
                        QD_孙登: {
                            sex: 'male',
                            skills: ['诓人'],
                        },
                        QD_藤芳兰: {
                            sex: 'female',
                            skills: ['落宠'],
                        },
                        QD_制衡: {
                            sex: 'male',
                            skills: ['制衡'],
                        },
                        QD_大乔: {
                            sex: 'female',
                            skills: ['国色', '流离'],
                        },
                        QD_徐晃: {
                            sex: 'male',
                            skills: ['断粮', '截辎'],
                        },
                        QD_神周瑜: {
                            sex: 'male',
                            skills: ['琴音', '业炎'],
                        },
                        QD_夏侯渊: {
                            sex: 'male',
                            skills: ['奇兵', '夺锐属性'],
                        },
                        QD_阎圃: {
                            sex: 'male',
                            skills: ['缓图'],
                        },
                        QD_左慈: {
                            sex: 'male',
                            skills: ['QD_huanshen', 'QD_xianshu'],
                        },
                        QD_杨婉: {
                            sex: 'female',
                            skills: ['诱言'],
                        },
                        QD_杨芷: {
                            sex: 'female',
                            skills: ['QD_wanyi', '埋祸'],
                        },
                        QD_宣公主: {
                            sex: 'female',
                            hp: 3,
                            maxHp: 6,
                            skills: ['比翼'],
                        },
                        QD_zhuge: {
                            sex: 'male',
                            skills: ['QD_dongfeng', 'QD_jinfa'],
                        },
                        QD_shenluxun: {
                            sex: 'male',
                            skills: ['QD_dinghuo', 'QD_junlve', 'QD_cuike'],
                        },
                        QD_chunge: {
                            sex: 'female',
                            skills: ['QD_jueqing', 'QD_shangshi'],
                        },
                        QD_孙笨: {
                            sex: 'male',
                            skills: ['QD_jiang'],
                        },
                        QD_dengai: {
                            sex: 'male',
                            skills: ['QD_tuntian'],
                        },
                        QD_zhongyao: {
                            sex: 'male',
                            skills: ['QD_huomo'],
                        },
                        QD_caozhen: {
                            sex: 'male',
                            skills: ['QD_sidi'],
                        },
                        QD_caozhi: {
                            sex: 'male',
                            skills: ['QD_luoying', 'QD_jiushi'],
                        },
                        QD_caoren: {
                            sex: 'male',
                            skills: ['QD_jushou', 'QD_jiewei'],
                        },
                        QD_xiahouyuan: {
                            sex: 'male',
                            skills: ['QD_shensu', 'QD_shebian'],
                        },
                        QD_xunyou: {
                            sex: 'male',
                            skills: ['QD_qice'],
                        },
                        QD_zhangrang: {
                            sex: 'male',
                            skills: ['QD_taoluan'],
                        },
                        QD_lvmeng: {
                            sex: 'male',
                            skills: ['QD_keji', 'QD_botu', 'QD_gongxin'],
                        },
                        QD_zhongyan: {
                            sex: 'female',
                            skills: ['QD_bolan'],
                        },
                        QD_sunhao: {
                            sex: 'male',
                            skills: ['QD_canshi', 'QD_chouhai'],
                        },
                        QD_zhangzhi: {
                            sex: 'male',
                            skills: ['QD_bixin', 'QD_feibai'],
                        },
                        QD_caocao: {
                            sex: 'male',
                            skills: ['QD_jianxiong', 'QD_hujia'],
                        },
                        QD_jushoux: {
                            sex: 'male',
                            skills: ['QD_jianying', 'QD_shibei'],
                        },
                        QD_xusheng: {
                            sex: 'male',
                            skills: ['QD_pojun'],
                        },
                        QD_luzhi: {
                            sex: 'male',
                            skills: ['QD_mingren', 'QD_zhenliang'],
                        },
                        QD_pengyang: {
                            sex: 'male',
                            skills: ['QD_xiaofan', 'QD_duishi', 'QD_cunmu'],
                        },
                        QD_chengpu: {
                            sex: 'male',
                            skills: ['QD_lihuo', 'QD_chunliao'],
                        },
                        QD_xushi: {
                            sex: 'female',
                            skills: ['QD_wengua', 'QD_fuzhu'],
                            trashBin: [`ext:缺德扩展/mp4/QD_xushi.mp4`],
                        },
                        QD_刘备: {
                            sex: 'male',
                            skills: ['QD_rende', '激将'],
                        },
                    },
                    characterIntro: {
                        QD_chunge: '设计者:裸睡天依(2847826324)<br>编写者:潜在水里的火(1476811518)',
                        QD_蛊惑: '设计者:瘟疫公司扩展作者(2224219574)<br>编写者:潜在水里的火(1476811518)',
                        QD_孙笨: '设计者:裸睡天依(2847826324)<br>编写者:潜在水里的火(1476811518)',
                        QD_沮授: '设计者:秋(1138146139)<br>编写者:潜在水里的火(1476811518)',
                        QD_夏侯渊: '设计者:秋(1138146139)<br>编写者:潜在水里的火(1476811518)',
                        QD_宣公主: '设计者:秋(1138146139)<br>编写者:潜在水里的火(1476811518)',
                    },
                    characterTitle: {
                        QD_蛊惑: `<b style='color: #00FFFF; font-size: 25px;'>無量諸佛,尚不免淪入暗影  恒沙世界,又豈能逸出夢魘</b>`,
                        QD_董卓: `<b style='color: #00FFFF; font-size: 25px;'>酒池肉林  唯我獨尊</b>`,
                        QD_孙笨: `<b style='color: #00FFFF; font-size: 25px;'>虎臣之子  嘯聚江東</b>`,
                        QD_神赵云: `<b style='color: #00FFFF; font-size: 25px;'>左持青釭  右擎龍胆</b>`,
                        QD_冯方女: `<b style='color: #00FFFF; font-size: 25px;'>殿前妝梳  風姿絕世</b>`,
                        QD_曹宪曹华: `<b style='color: #00FFFF; font-size: 25px;'>左山右樹  桃酒不斷</b>`,
                        QD_李典: `<b style='color: #00FFFF; font-size: 25px;'>乘風采日月  道藏天地間</b>`,
                        QD_杨艳: `<b style='color: #00FFFF; font-size: 25px;'>千載胭脂緋色淚  刺得龍血畫眉紅</b>`,
                        QD_神司马: `<b style='color: #00FFFF; font-size: 25px;'>老夫,即是天命</b>`,
                        QD_神吕布: `<b style='color: #00FFFF; font-size: 25px;'>神罰滅世  煉獄即臨</b>`,
                        QD_杨婉: `<b style='color: #00FFFF; font-size: 25px;'>前路之行,幽深且阻,此局不可言喻  失卻之物,恒久徘徊,此地靜謐瘋狂</b>`,
                        QD_兀突骨: `<b style='color: #00FFFF; font-size: 25px;'>火海肉魔</b>`,
                    },
                    skill: {
                        // 阶段限一次,你可以将牌堆底一张牌扣置当任意一张基本牌或普通锦囊牌使用或打出
                        // 其他所有角色依次选择是否质疑,有人质疑则翻开此牌
                        // 若此牌与你声明的牌相同,质疑者获得一个<惑>标记;
                        // 反之则此牌作废,你本回合对质疑者使用牌无距离次数限制
                        // 每有一个质疑者,你增加一次蛊惑次数
                        // 拥有<惑>标记的角色不可质疑你的蛊惑
                        // 每回合结束时你可以移除惑标记,视为使用移除的标记数张任意牌
                        蛊惑: {
                            mod: {
                                targetInRange(card, player, target) {
                                    if (target.hasSkill('蛊惑_2')) {
                                        return true;
                                    }
                                },
                                cardUsableTarget(card, player, target) {
                                    if (target.hasSkill('蛊惑_2')) {
                                        return true;
                                    }
                                },
                            },
                            enable: ['chooseToUse', 'chooseToRespond'],
                            usable: 1,
                            hiddenCard(player, name) {
                                return player.countCards('hs');
                            },
                            filter(event, player) {
                                return player.qcard().length && player.countCards('hs');
                            },
                            chooseButton: {
                                dialog(event, player) {
                                    return ui.create.dialog('蛊惑', [player.qcard(), 'vcard']);
                                },
                                check(button) {
                                    const player = _status.event.player;
                                    const num = player.getUseValue(
                                        {
                                            name: button.link[2],
                                            nature: button.link[3],
                                        },
                                        null,
                                        true
                                    );
                                    if (['wuzhong', 'dongzhuxianji'].includes(button.link[2]) && player.countCards('h') < 4) {
                                        return number0(num) * 2 + 10;
                                    }
                                    return number0(num) + 10;
                                },
                                backup(links, player) {
                                    return {
                                        viewAs: {
                                            name: links[0][2],
                                            nature: links[0][3],
                                            suit: links[0][0],
                                            number: links[0][1],
                                        },
                                        filterCard(card, player, target) {
                                            let result = true;
                                            const suit = card.suit,
                                                number = card.number;
                                            card.suit = 'none';
                                            card.number = null;
                                            const mod = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
                                            if (mod != 'unchanged') {
                                                result = mod;
                                            }
                                            card.suit = suit;
                                            card.number = number;
                                            return result;
                                        },
                                        position: 'hs',
                                        ignoreMod: true,
                                        check(card) {
                                            return 12 - get.value(card);
                                        }, //加强于吉AI
                                        async precontent(event, trigger, player) {
                                            player.addTempSkill('蛊惑_1');
                                            let card = event.result.cards[0];
                                            event.result.card.suit = card.suit;
                                            event.result.card.number = card.number;
                                        },
                                    };
                                },
                                prompt(links, player) {
                                    return '将一张手牌当做' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '使用';
                                },
                            },
                            ai: {
                                fireAttack: true,
                                save: true,
                                respondSha: true,
                                respondShan: true,
                                skillTagFilter(player, tag) {
                                    return Boolean(player.countCards('hs'));
                                },
                                order: 120,
                                result: {
                                    player: 1,
                                },
                                threaten: 1.3,
                            },
                            group: ['蛊惑_3'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        player: ['useCardBefore', 'respondBefore'],
                                    },
                                    forced: true,
                                    silent: true,
                                    popup: false,
                                    charlotte: true,
                                    firstDo: true,
                                    filter(event, player) {
                                        return event.skill && event.skill.indexOf('蛊惑_') == 0;
                                    },
                                    async content(event, trigger, player, cards) {
                                        event.fake = false;
                                        let card = trigger.cards[0];
                                        if (card.name != trigger.card.name || (card.name == 'sha' && !get.is.sameNature(trigger.card, card))) {
                                            event.fake = true;
                                        }
                                        player.line(trigger.targets, get.nature(trigger.card));
                                        event.cardTranslate = get.translation(trigger.card.name);
                                        trigger.card.number = card.number;
                                        trigger.card.suit = card.suit;
                                        trigger.skill = '蛊惑_backup';
                                        if (trigger.card.name == 'sha' && get.natureList(trigger.card).length) {
                                            event.cardTranslate = get.translation(trigger.card.nature) + event.cardTranslate;
                                        }
                                        player.popup(event.cardTranslate, trigger.name == 'useCard' ? 'metal' : 'wood');
                                        event.prompt = `是否肯定${get.translation(player)}声明的${event.cardTranslate}？`;
                                        game.log(`<span class="greentext">${get.translation(player)}声明了${event.cardTranslate}</span>`);
                                        event.targets = game
                                            .filterPlayer(function (current) {
                                                return current != player && !current.hasMark('蛊惑');
                                            })
                                            .sortBySeat();
                                        event.targets2 = event.targets.slice(0);
                                        player.lose(card, ui.ordering).relatedEvent = trigger;
                                        if (event.targets.length) {
                                            event.betrays = [];
                                            for (const Q of event.targets) {
                                                const result = await Q.chooseButton([event.prompt, [['肯定', '质疑'], 'vcard']], true, function (button) {
                                                    const ally = button.link[2] == '肯定';
                                                    if (ally && (Q.hp <= 1 || get.attitude(Q, player) >= 0)) {
                                                        return 1.1;
                                                    }
                                                    return Math.random();
                                                }).forResult();
                                                if (result.links[0][2] == '质疑') {
                                                    event.betrays.push(Q);
                                                }
                                            }
                                            for (const i of event.targets2) {
                                                const b = event.betrays.includes(i);
                                                i.popup(b ? '肯定' : '质疑', b ? 'fire' : 'wood');
                                                game.log(i, b ? '<span class="greentext">肯定</span>' : '<span class="firetext">质疑</span>');
                                            }
                                            player.showCards(trigger.cards);
                                            if (event.betrays.length) {
                                                event.betrays.sortBySeat();
                                                if (event.fake) {
                                                    trigger.cancel();
                                                    trigger.parent.goto(0);
                                                    game.log(`<span class="greentext">${get.translation(player)}声明的${event.cardTranslate}作废了</span>`);
                                                    while (event.betrays.length) {
                                                        event.betrays.shift().addTempSkills('蛊惑_2');
                                                        lib.skill.蛊惑.usable++;
                                                    }
                                                } else {
                                                    while (event.betrays.length) {
                                                        event.betrays.shift().addMark('蛊惑');
                                                    }
                                                }
                                            }
                                        }
                                    },
                                },
                                2: {
                                    charlotte: true,
                                },
                                3: {
                                    trigger: {
                                        global: ['phaseEnd'],
                                    },
                                    prompt: '移除惑标记,视为使用移除的标记数张任意牌',
                                    filter: (event, player) => game.countPlayer((Q) => Q.hasMark('蛊惑')),
                                    forced: true,
                                    async content(event, trigger, player, cards) {
                                        const result = await player.chooseTarget('选择移除惑的角色', (card, player, target) => target.hasMark('蛊惑')).forResult();
                                        if (result.bool) {
                                            while (result.targets.length) {
                                                result.targets.shift().removeMark('蛊惑');
                                                const result1 = await player
                                                    .chooseButton(['视为使用一张牌', [player.qcard(false, true, false), 'vcard']])
                                                    .set('ai', () => Math.random())
                                                    .forResult();
                                                if (result1.bool) {
                                                    await player.chooseUseTarget({ name: result1.links[0][2] }, true, false, 'nodistance');
                                                }
                                            }
                                        }
                                    },
                                },
                            },
                        },
                        煽火: {
                            trigger: {
                                global: ['damageAfter'],
                            },
                            check(event, player) {
                                return event.player.isFriendsOf(player);
                            },
                            filter(event, player) {
                                return event.source && (event.player == player || !player.hasSkill('煽火_1'));
                            },
                            async content(event, trigger, player) {
                                player.chooseToDebate(game.players).set('callback', async (event) => {
                                    const result = event.debateResult;
                                    if (result.bool && result.opinion) {
                                        const { opinion, targets } = result;
                                        targets.sortBySeat();
                                        if (opinion == 'red') {
                                            await trigger.source.chooseToGive(trigger.player, 'he', trigger.player.getDamagedHp(), true);
                                            trigger.source.loseHp();
                                        } else {
                                            const result1 = await trigger.source.chooseControl('不能用牌', '翻面').forResult();
                                            if (result1.control == '不能用牌') {
                                                trigger.source.addTempSkill('drlt_xiongluan_ban', { global: 'roundStart' });
                                            } else {
                                                trigger.source.turnOver(true);
                                            }
                                        }
                                    }
                                });
                                player.addTempSkill('煽火_1', { global: 'roundStart' });
                            },
                            group: ['煽火_2'],
                            subSkill: {
                                1: {
                                    charlotte: true,
                                },
                                2: {
                                    trigger: {
                                        global: 'debateShowOpinion',
                                    },
                                    filter: (event, player) => game.countPlayer((Q) => Q.hasMark('蛊惑')) > game.countPlayer((Q) => !Q.hasMark('蛊惑')),
                                    forced: true,
                                    async content(event, trigger, player) {
                                        let myOpinion, dissent;
                                        const colors = ['red', 'black'];
                                        for (const color of colors) {
                                            if (trigger[color].some((i) => i[0] == player)) {
                                                myOpinion = color;
                                                dissent = colors.find((i) => i != color);
                                                break;
                                            }
                                        }
                                        const dissident = [];
                                        for (let i = 0; i < trigger[dissent].length; i++) {
                                            const pair = trigger[dissent][i];
                                            if (game.players.filter((Q) => Q.hasMark('蛊惑')).includes(pair[0])) {
                                                dissident.push(pair[0]);
                                                trigger[myOpinion].push(pair);
                                                trigger[dissent].splice(i--, 1);
                                            }
                                        }
                                    },
                                },
                            },
                        },
                        QD_暴虐: {
                            trigger: {
                                global: 'changeHp',
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                let count = Math.min(numberq1(trigger.num), 9);
                                while (count-- > 0) {
                                    const E = get.cards(1);
                                    await game.cardsGotoOrdering(E);
                                    await player.showCards(E, 'QD_暴虐');
                                    if (E[0].suit == 'spade') {
                                        await player.recover();
                                        await player.gain(E[0], 'gain2', 'log');
                                    }
                                }
                            },
                        },
                        QD_roulin: {
                            trigger: {
                                global: ['loseEnd'],
                            },
                            filter(event, player) {
                                if (event.cards && event.cards.some((q) => q.suit == 'spade')) {
                                    return !['recast', 'gift'].includes(event.getParent(2).name) && !['useCard', 'respond', 'equip'].includes(event.parent.name);
                                }
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                let cards = trigger.cards.filter((q) => q.suit == 'spade');
                                player.gain(cards, 'gain2');
                            },
                        },
                        冲阵: {
                            init(player) {
                                player.storage.冲阵 = new Map([
                                    ['none', 'zhuge'],
                                    ['heart', 'tao'],
                                    ['diamond', 'sha'],
                                    ['club', 'shan'],
                                    ['spade', 'wuxie'],
                                ]);
                            },
                            audio: 'chongzhen', //QQQ
                            enable: ['chooseToUse', 'chooseToRespond'],
                            prompt: '你可将牌按如下<♥️️️桃/♦️️火杀/♣️️闪/♠️️牌无懈/🃏诸葛>花色对应关系使用或打出',
                            viewAs(cards, player) {
                                const card = cards[0];
                                if (!card) {
                                    return null;
                                }
                                const vcard = {
                                    name: player.storage.冲阵.get(card.suit),
                                    cards: cards,
                                };
                                if (vcard.name == 'sha') {
                                    vcard.nature = 'fire';
                                }
                                if (vcard.name == 'zhuge') {
                                    card.cardSymbol = Symbol();
                                    card[card.cardSymbol] = new lib.element.VCard([card.suit, card.number, 'zhuge', card.nature]);
                                }
                                return vcard;
                            },
                            hiddenCard(player, name) {
                                for (const [suit, targetName] of player.storage.冲阵) {
                                    if (targetName === name) {
                                        return player.countCards('he', { suit }) > 0;
                                    }
                                }
                            },
                            check(card) {
                                return 90 - get.value(card);
                            },
                            position: 'he',
                            filterCard(card, player, event) {
                                return player.filterCard(player.storage.冲阵.get(card.suit));
                            },
                            selectCard: 1,
                            filter(event, player) {
                                for (const [suit, name] of player.storage.冲阵) {
                                    if (player.countCards('he', { suit }) && player.filterCard(name)) {
                                        return true;
                                    }
                                }
                            },
                            async precontent(event, trigger, player) {
                                const target = game.players.find((q) => q.isEnemiesOf(player) && q.countCards('he'));
                                if (target) {
                                    player.gain(target.getCards('he').randomGet(), 'gain2');
                                }
                            },
                            ai: {
                                save: true,
                                respondSha: true,
                                respondShan: true,
                                skillTagFilter(player, tag) {
                                    if (tag == 'respondSha') {
                                        return Boolean(player.countCards('hes', { suit: 'diamond' }));
                                    }
                                    if (tag == 'respondShan') {
                                        return Boolean(player.countCards('hes', { suit: 'club' }));
                                    }
                                    return Boolean(player.countCards('hes', { color: 'heart' }));
                                },
                                order: 15,
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
                        绝境: {
                            mod: {
                                maxHandcard(player, num) {
                                    return 5 + num;
                                },
                            },
                            trigger: {
                                player: ['dying', 'dyingAfter'],
                            },
                            forced: true,
                            content() {
                                player.draw(2);
                            },
                        },
                        琼梳: {
                            equipSkill: true,
                            trigger: {
                                player: 'damageBegin4',
                            },
                            forced: true,
                            filter: (event, player) => player.countCards('he'),
                            async content(event, trigger, player) {
                                const { result } = await player.chooseToDiscard('he', '弃置牌并防止伤害', [1, trigger.num]).set('ai', (card) => 20 - get.value(card));
                                if (result.cards && result.cards[0]) {
                                    trigger.num -= result.cards.length;
                                }
                            },
                        },
                        金梳: {
                            equipSkill: true,
                            trigger: {
                                player: 'phaseEnd',
                            },
                            forced: true,
                            filter(event, player) {
                                return player.countCards('h') < player.maxHp;
                            },
                            async content(event, trigger, player) {
                                player.drawTo(Math.min(50, player.maxHp));
                            },
                        },
                        犀梳: {
                            equipSkill: true,
                            trigger: {
                                player: ['phaseJudgeBefore', 'phaseDiscardBefore'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                trigger.cancel();
                            },
                        },
                        垂涕: {
                            trigger: {
                                global: ['loseEnd'],
                            },
                            forced: true,
                            filter(event, player) {
                                return !['useCard', 'respond', 'equip'].includes(event.parent.name) && event.cards?.length;
                            },
                            async content(event, trigger, player) {
                                for (const i of trigger.cards) {
                                    await player.chooseUseTarget(i, true, false, 'nodistance');
                                }
                            },
                        },
                        妆梳: {
                            trigger: {
                                global: 'phaseBegin',
                            },
                            forced: true,
                            filter(event, player) {
                                return event.player != player && player.hasCard(lib.skill.zhuangshu.filterCard, 'he');
                            },
                            filterCard(card) {
                                if (_status.connectMode) {
                                    return true;
                                }
                                const type = get.type2(card);
                                return type == 'basic' || type == 'trick' || type == 'equip';
                            },
                            async content(event, trigger, player) {
                                const {
                                    result: { cards },
                                } = await player
                                    .chooseToDiscard('he', get.prompt('zhuangshu', trigger.player), '弃置一张牌,并根据此牌的类型,按如下关系将一张宝物牌置入该角色的装备区:{<基本牌,【琼梳】>,<锦囊牌,【犀梳】>,<装备牌,【金梳】>}.', function (card) {
                                        const type = get.type2(card);
                                        return type == 'basic' || type == 'trick' || type == 'equip';
                                    })
                                    .set('ai', function (card) {
                                        if (get.attitude(player, trigger.player) < 0) {
                                            return 0;
                                        }
                                        return 15 - get.value(card);
                                    });
                                if (cards?.length) {
                                    const type = get.type(cards[0]);
                                    let name = '金梳';
                                    if (type == 'basic') {
                                        name = '琼梳';
                                    } else if (type == 'trick') {
                                        name = '犀梳';
                                    }
                                    if (lib.card[name] && trigger.player.hasEmptySlot(5)) {
                                        let card = game.createCard(name);
                                        trigger.player.$gain2(card, false);
                                        trigger.player.equip(card);
                                    }
                                }
                            },
                        },
                        鸣: {
                            enable: 'phaseUse',
                            filter(event, player) {
                                return player.countCards('h') > 5;
                            },
                            async content(event, trigger, player) {
                                player.randomDiscard('h', 6);
                                const list = get.inpile('trick', 'trick').randomGets(3);
                                for (let i = 0; i < list.length; i++) {
                                    list[i] = game.createCard(list[i]);
                                }
                                player.gain(list, 'draw');
                            },
                            ai: {
                                basic: {
                                    order: 1,
                                },
                                result: {
                                    player(player) {
                                        return 1;
                                    },
                                },
                            },
                        },
                        化木: {
                            init(player) {
                                player.disableEquip('equip1');
                            },
                            marktext: '木',
                            intro: {
                                name: '灵杉&玉树',
                                markcount(storage, player) {
                                    const red = [],
                                        black = [];
                                    let cards = player.getExpansions('化木');
                                    for (const i of cards) {
                                        const color = get.color(i, false);
                                        (color == 'red' ? red : black).push(i);
                                    }
                                    return `${black.length}/${red.length}`;
                                },
                                content: 'expansion',
                                mark(dialog, storage, player) {
                                    const red = [],
                                        black = [];
                                    let cards = player.getExpansions('化木');
                                    for (const i of cards) {
                                        const color = get.color(i, false);
                                        (color == 'red' ? red : black).push(i);
                                    }
                                    if (black.length) {
                                        dialog.addText('灵杉');
                                        dialog.addSmall(black);
                                    }
                                    if (red.length) {
                                        dialog.addText('玉树');
                                        dialog.addSmall(red);
                                    }
                                },
                            },
                            trigger: {
                                player: ['useCardAfter', 'respondAfter'],
                            },
                            filter(event, player) {
                                const color = get.color(event.card);
                                if (color == 'none') {
                                    return false;
                                }
                                if (get.type(event.card) == 'equip') {
                                    return false;
                                }
                                return event.cards && event.cards[0];
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                player.addToExpansion(trigger.cards, 'gain2').gaintag.add('化木');
                            },
                            ai: {
                                reverseOrder: true,
                                combo: '前盟',
                            },
                        },
                        良缘: {
                            enable: 'chooseToUse',
                            hiddenCard(player, name) {
                                if (name == 'tao') {
                                    return player.getExpansions('化木').filter((i) => get.color(i) == 'red').length;
                                } else if (name == 'jiu') {
                                    return player.getExpansions('化木').filter((i) => get.color(i) == 'black').length;
                                }
                                return false;
                            },
                            filter(event, player) {
                                const map = { jiu: 'black', tao: 'red' };
                                return ['jiu', 'tao'].some((type) => player.filterCard(type) && player.getExpansions('化木').some((i) => get.color(i) === map[type]));
                            },
                            chooseButton: {
                                dialog(event, player) {
                                    const map = { jiu: 'black', tao: 'red' };
                                    const list = ['jiu', 'tao'].filter((type) => player.filterCard(type) && player.getExpansions('化木').some((i) => get.color(i) === map[type]));
                                    return ui.create.dialog('良缘', [list, 'vcard'], 'hidden');
                                },
                                check(button) {
                                    const player = _status.event.player;
                                    return number0(player.getUseValue({ name: button.link[2] }, null, true)) + 10;
                                },
                                backup(links, player) {
                                    let name = links[0][2],
                                        color = name == 'tao' ? 'red' : 'black';
                                    let cards = player.getExpansions('化木').filter((i) => get.color(i, false) == color);
                                    if (!cards.length) {
                                        return false;
                                    }
                                    let card = { name: name };
                                    return {
                                        viewAs: card,
                                        color: color,
                                        selectCard: -1,
                                        filterCard: () => false,
                                        async precontent(event, trigger, player) {
                                            const color = lib.skill.良缘_backup.color;
                                            player.loseToDiscardpile(
                                                player
                                                    .getExpansions('化木')
                                                    .filter((i) => get.color(i, false) == color)
                                                    .randomGet()
                                            );
                                        },
                                    };
                                },
                                prompt(links, player) {
                                    let name = links[0][2],
                                        color = name == 'tao' ? '玉树' : '灵杉';
                                    return `将一枚<${color}>当做【${get.translation(name)}】使用`;
                                },
                            },
                            ai: {
                                save: true,
                                order: 1,
                                result: {
                                    player(player) {
                                        if (_status.event.dying) {
                                            return get.attitude(player, _status.event.dying);
                                        }
                                        return 1;
                                    },
                                },
                                combo: '化木',
                                tag: {
                                    recover: 1,
                                    save: 1,
                                },
                            },
                        },
                        前盟: {
                            trigger: {
                                global: ['loseEnd', 'equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
                            },
                            filter(event, player) {
                                if (event.name == 'addToExpansion') {
                                    return event.gaintag.includes('化木');
                                }
                                if (event.name == 'lose' && event.getlx !== false) {
                                    for (let i in event.gaintag_map) {
                                        if (event.gaintag_map[i].includes('化木')) {
                                            return true;
                                        }
                                    }
                                    return false;
                                }
                                return game.getGlobalHistory('cardMove', function (evt) {
                                    if (evt.name != 'lose' || event != evt.parent) {
                                        return false;
                                    }
                                    for (let i in evt.gaintag_map) {
                                        if (evt.gaintag_map[i].includes('化木')) {
                                            return true;
                                        }
                                    }
                                    return false;
                                }).length;
                            },
                            forced: true,
                            content() {
                                player.draw();
                            },
                            ai: {
                                combo: '化木',
                            },
                        },
                        羁肆: {
                            trigger: {
                                player: 'phaseZhunbeiBegin',
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                const {
                                    result: { targets },
                                } = await player.chooseTarget(get.prompt('羁肆'), lib.filter.notMe).set('ai', (t) => t.isFriendsOf(player));
                                if (targets && targets[0]) {
                                    player.awakenSkill('羁肆');
                                    targets[0].addSkill('前盟');
                                }
                            },
                        },
                        恂恂: {
                            trigger: {
                                player: ['changeHp'],
                                global: ['roundStart'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                let count = Math.min(numberq1(trigger.num), 9);
                                while (count-- > 0) {
                                    let cards = get.cards(5);
                                    game.cardsGotoOrdering(cards);
                                    player.showCards(cards);
                                    const { result } = await player.chooseControl('获得两张牌', '使用一张牌');
                                    if (result.control == '获得两张牌') {
                                        const { result: result1 } = await player.chooseButton(['获得两张牌', cards], 2, true).set('ai', function (button) {
                                            if (get.tag(button.link, 'recover')) {
                                                return 99;
                                            }
                                            return get.value(button.link, player);
                                        });
                                        if (result1.links && result1.links[0]) {
                                            player.gain(result1.links, 'log', 'gain2');
                                            cards.remove(result1.links[0]);
                                            while (cards.length) {
                                                ui.cardPile.appendChild(cards.shift().fix());
                                            }
                                        }
                                    } else {
                                        const { result: result1 } = await player.chooseButton(['使用一张牌', cards], 1, true).set('ai', function (button) {
                                            const num = player.getUseValue(button.link, null, true);
                                            if (get.tag(button.link, 'recover')) {
                                                return 99;
                                            }
                                            return number0(num) + 10;
                                        });
                                        if (result1.links && result1.links[0]) {
                                            player.chooseUseTarget(result1.links[0], true, false, 'nodistance');
                                            cards.remove(result1.links[0]);
                                            while (cards.length) {
                                                ui.cardPile.appendChild(cards.shift().fix());
                                            }
                                        }
                                    }
                                }
                            },
                            ai: {
                                maixie: true,
                            },
                        },
                        娴婉: {
                            hiddenCard(player, name) {
                                return get.type(name) == 'basic' && game.hasPlayer((Q) => !Q.isLinked());
                            },
                            enable: ['chooseToUse', 'chooseToRespond'],
                            filter(event, player) {
                                return player.qcard('basic').length && game.hasPlayer((Q) => !Q.isLinked());
                            },
                            chooseButton: {
                                dialog(event, player) {
                                    return ui.create.dialog('娴婉', [player.qcard('basic'), 'vcard'], 'hidden');
                                },
                                check(button, buttons) {
                                    const player = _status.event.player;
                                    const num = player.getUseValue(
                                        {
                                            name: button.link[2],
                                            nature: button.link[3],
                                        },
                                        null,
                                        true
                                    ); //null是距离限制//true是用牌次数限制
                                    if (button.link[3] == 'kami') {
                                        return number0(num) * 2 + 10;
                                    } //神杀优先无脑提高会导致出杀默认神杀,碰到对神杀高收益的就会卡死
                                    return number0(num) + 10; //不加这行会出现有button返回undefined导致无法判断直接结束回合
                                    //有些高手写的卡牌返回NAN也会导致无法判断,所以用 Number
                                },
                                backup(links, player) {
                                    return {
                                        filterCard: () => false,
                                        selectCard: -1,
                                        viewAs: {
                                            name: links[0][2],
                                            nature: links[0][3],
                                            suit: links[0][0],
                                            number: links[0][1],
                                            storage: { [_status.event.buttoned]: true },
                                        },
                                        ignoreMod: true,
                                        async precontent(event, trigger, player) {
                                            game.log('#g【娴婉】', event.result.card);
                                            player.popup(event.result.card, 'thunder');
                                            const E = game.players
                                                .filter((Q) => {
                                                    return !Q.isLinked();
                                                })
                                                .randomGet();
                                            player.line(E, 'green');
                                            E.link();
                                        },
                                    };
                                },
                                prompt(links, player) {
                                    return '将一名角色武将牌横置并视为使用基本牌';
                                },
                            },
                            ai: {
                                order: 99,
                                //无脑用牌: true,
                                respondShan: true,
                                respondSha: true,
                                save: true,
                                skillTagFilter(player, tag, arg) {
                                    return game.hasPlayer((Q) => !Q.isLinked());
                                },
                                basic: {
                                    useful: 99,
                                    value: 99,
                                },
                                result: {
                                    player(player) {
                                        if (_status.event.dying) {
                                            return get.attitude(player, _status.event.dying);
                                        }
                                        return 10;
                                    },
                                },
                                effect: {
                                    player(card, player, target) {
                                        if (card.name == 'sha') {
                                            return [0, 2, 0, -2];
                                        }
                                    },
                                },
                            },
                            group: ['娴婉_1'],
                            subSkill: {
                                1: {
                                    hiddenCard(player, name) {
                                        return get.type(name) == 'trick' && game.hasPlayer((Q) => Q.isLinked());
                                    },
                                    enable: ['chooseToUse', 'chooseToRespond'],
                                    filter(event, player) {
                                        return player.qcard('trick').length && game.hasPlayer((Q) => Q.isLinked());
                                    },
                                    chooseButton: {
                                        dialog(event, player) {
                                            return ui.create.dialog('娴婉', [player.qcard('trick'), 'vcard']);
                                        },
                                        check(button, buttons) {
                                            // if (buttons) {
                                            //     const qqq = {};
                                            //     for (const i of buttons) {
                                            //         qqq[i.link[2]] = Math.ceil(_status.event.player.getUseValue({ name: i.link[2] }, null, true));
                                            //     }
                                            //     console.log(qqq);
                                            // }
                                            const player = _status.event.player;
                                            const num = player.getUseValue(
                                                {
                                                    name: button.link[2],
                                                    nature: button.link[3],
                                                },
                                                null,
                                                true
                                            );
                                            if (button.link[2] == 'juedou' && player.hp > player.maxHp / 2) {
                                                return number0(num) * 8 + 10;
                                            }
                                            if (button.link[2] == 'shunshou') {
                                                return number0(num) * 2 + 10;
                                            }
                                            return number0(num) + 10;
                                        },
                                        backup(links, player) {
                                            return {
                                                filterCard: () => false,
                                                selectCard: -1,
                                                viewAs: {
                                                    name: links[0][2],
                                                    nature: links[0][3],
                                                    suit: links[0][0],
                                                    number: links[0][1],
                                                },
                                                async precontent(event, trigger, player) {
                                                    game.log('#g【娴婉】', event.result.card);
                                                    player.popup(event.result.card, 'thunder');
                                                    const E = game.players
                                                        .filter((Q) => {
                                                            return Q.isLinked();
                                                        })
                                                        .randomGet();
                                                    player.line(E, 'green');
                                                    E.link();
                                                },
                                            };
                                        },
                                        prompt(links, player) {
                                            return '将一名角色武将牌重置并视为使用锦囊牌';
                                        },
                                    },
                                    ai: {
                                        order: 50,
                                        effect: {
                                            player(card, player, target) {
                                                if (card.name == 'juedou' && player.hp > 2) {
                                                    return [0, 3, 1, -3];
                                                }
                                            },
                                        },
                                        result: {
                                            player(player) {
                                                return 10;
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        忍戒: {
                            audio: 'renjie2',
                            trigger: {
                                player: ['changeHp', 'loseEnd'],
                            },
                            filter(event, player) {
                                if ('lose' == event.name) {
                                    if (event.getParent('phaseUse', true) && _status.currentPhase == player) {
                                        return false;
                                    }
                                }
                                return true;
                            },
                            forced: true,
                            intro: {
                                name2: '忍',
                                content: 'mark',
                            },
                            async content(event, trigger, player) {
                                const num = numberq1(trigger.num || trigger.cards?.length);
                                player.addMark('忍戒', num);
                                if (player.countMark('忍戒') > 3 && !player.hasSkill('极略')) {
                                    player.gainMaxHp();
                                    player.recover(2);
                                    player.draw(2);
                                    player.addSkill('极略');
                                }
                            },
                        },
                        极略: {
                            group: ['极略_guicai', '极略_fangzhu', '极略_wansha', '极略_zhiheng'],
                            subSkill: {
                                guicai: {
                                    trigger: {
                                        global: 'judge',
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return player.countCards('hes') > 0 && player.hasMark('忍戒');
                                    },
                                    content() {
                                        'step 0';
                                        player.chooseCard('是否弃置一枚<忍>,并发动〖鬼才〗？', 'hes', function (card) {
                                            const player = _status.event.player;
                                            const mod2 = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
                                            if (mod2 != 'unchanged') {
                                                return mod2;
                                            }
                                            const mod = game.checkMod(card, player, 'unchanged', 'cardRespondable', player);
                                            if (mod != 'unchanged') {
                                                return mod;
                                            }
                                            return true;
                                        }).ai = function (card) {
                                            const trigger = _status.event.parent._trigger;
                                            const player = _status.event.player;
                                            let result = trigger.judge(card) - trigger.judge(trigger.player.judging[0]);
                                            const attitude = get.attitude(player, trigger.player);
                                            if (attitude == 0 || result == 0) {
                                                return 0;
                                            }
                                            if (attitude > 0) {
                                                return result - get.value(card) / 2;
                                            } else {
                                                return -result - get.value(card) / 2;
                                            }
                                        };
                                        ('step 1');
                                        if (result.bool) {
                                            player.respond(result.cards, 'highlight', 'jilue_guicai', 'noOrdering');
                                        } else {
                                            event.finish();
                                        }
                                        ('step 2');
                                        if (result.bool) {
                                            player.removeMark('忍戒', 1);
                                            if (trigger.player.judging[0].clone) {
                                                trigger.player.judging[0].clone.delete();
                                                game.addVideo('deletenode', player, get.cardsInfo([trigger.player.judging[0].clone]));
                                            }
                                            game.cardsDiscard(trigger.player.judging[0]);
                                            trigger.player.judging[0] = result.cards[0];
                                            trigger.orderingCards.addArray(result.cards);
                                            game.log(trigger.player, '的判定牌改为', result.cards[0]);
                                        }
                                    },
                                },
                                fangzhu: {
                                    trigger: {
                                        player: 'damageEnd',
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return player.hasMark('忍戒');
                                    },
                                    content() {
                                        'step 0';
                                        player
                                            .chooseTarget('是否弃置一枚<忍>,并发动【放逐】？', function (card, player, target) {
                                                return player != target;
                                            })
                                            .set('ai', (target) => {
                                                if (target.hasSkillTag('noturn')) {
                                                    return 0;
                                                }
                                                const player = _status.event.player;
                                                const current = _status.currentPhase;
                                                let dis = current ? get.distance(current, target, 'absolute') : 1;
                                                const draw = player.getDamagedHp();
                                                const att = get.attitude(player, target);
                                                if (att == 0) {
                                                    return target.hasJudge('lebu') ? Math.random() / 3 : Math.sqrt(get.threaten(target)) / 5 + Math.random() / 2;
                                                }
                                                if (att > 0) {
                                                    if (target.isTurnedOver()) {
                                                        return att + draw;
                                                    }
                                                    if (draw < 4) {
                                                        return -1;
                                                    }
                                                    if (current && target.seatNum > current.seatNum) {
                                                        return att + draw / 3;
                                                    }
                                                    return (10 * Math.sqrt(Math.max(0.01, get.threaten(target)))) / (3.5 - draw) + dis / (2 * game.countPlayer());
                                                } else {
                                                    if (target.isTurnedOver()) {
                                                        return att - draw;
                                                    }
                                                    if (draw >= 5) {
                                                        return -1;
                                                    }
                                                    if (current && target.seatNum <= current.seatNum) {
                                                        return -att + draw / 3;
                                                    }
                                                    return (4.25 - draw) * 10 * Math.sqrt(Math.max(0.01, get.threaten(target))) + (2 * game.countPlayer()) / dis;
                                                }
                                            });
                                        ('step 1');
                                        if (result.bool) {
                                            player.removeMark('忍戒', 1);
                                            result.targets[0].draw(player.maxHp - player.hp);
                                            result.targets[0].turnOver();
                                        }
                                    },
                                },
                                wansha: {
                                    audio: 'wansha',
                                    audioname: ['shen_simayi'],
                                    enable: 'phaseUse',
                                    usable: 1,
                                    filter(event, player) {
                                        return player.hasMark('忍戒');
                                    },
                                    async content(event, trigger, player) {
                                        player.removeMark('忍戒', 1);
                                        player.addTempSkill('rewansha');
                                    },
                                    ai: {
                                        order(name, player) {
                                            if (player.getEnemies().length > 1 && player.getEnemies().some((q) => q.hp < 2)) {
                                                return 1;
                                            }
                                            return 0;
                                        },
                                        result: {
                                            player(player, target, card) {
                                                //主动技是否发动
                                                if (player.getEnemies().length > 1 && player.getEnemies().some((q) => q.hp < 2)) {
                                                    return 1;
                                                }
                                            },
                                        },
                                    },
                                },
                                zhiheng: {
                                    mod: {
                                        aiOrder(player, card, num) {
                                            if (num <= 0 || get.itemtype(card) != 'card' || get.type(card) != 'equip') {
                                                return num;
                                            }
                                            const eq = player.getEquip(get.subtype(card));
                                            if (eq && get.equipValue(card) - get.equipValue(eq) < Math.max(1.2, 6 - player.hp)) {
                                                return 0;
                                            }
                                        },
                                    },
                                    enable: 'phaseUse',
                                    filter(event, player) {
                                        return player.hasMark('忍戒');
                                    },
                                    position: 'he',
                                    filterCard(card, player, event) {
                                        event = event || _status.event;
                                        if (typeof event != 'string') {
                                            event = event.parent.name;
                                        }
                                        const mod = game.checkMod(card, player, event, 'unchanged', 'cardDiscardable', player);
                                        if (mod != 'unchanged') {
                                            return mod;
                                        }
                                        return true;
                                    },
                                    discard: false,
                                    lose: false,
                                    delay: false,
                                    selectCard: [1, Infinity],
                                    prompt: '弃置一枚<忍>,弃置任意张牌并摸等量的牌.若弃置了所有的手牌,则可以多摸一张牌',
                                    check(card) {
                                        if (get.position(card) == 'h') {
                                            return 999 - get.value(card);
                                        }
                                        return 6 - get.value(card);
                                    },
                                    content() {
                                        'step 0';
                                        player.removeMark('忍戒', 1);
                                        player.discard(cards);
                                        event.num = 1;
                                        const hs = player.getCards('h');
                                        if (!hs.length) {
                                            event.num = 0;
                                        }
                                        for (let i = 0; i < hs.length; i++) {
                                            if (!cards.includes(hs[i])) {
                                                event.num = 0;
                                                break;
                                            }
                                        }
                                        ('step 1');
                                        player.draw(event.num + cards.length);
                                    },
                                    ai: {
                                        order(name, player) {
                                            if (player.countCards('h') == 1 && player.countMark('忍戒') > 0) {
                                                return 99;
                                            }
                                            return 1;
                                        },
                                        result: {
                                            player: 1,
                                        },
                                    },
                                },
                            },
                        },
                        QD_kuroux: {
                            trigger: {
                                player: ['phaseAfter'],
                            },
                            forced: true,
                            init(p) {
                                p.storage.QD_kuroux = 0;
                            },
                            filter(e, p) {
                                return p.storage.QD_kuroux > 0;
                            },
                            async content(event, trigger, player) {
                                player.storage.QD_kuroux--;
                                player.phase('nodelay');
                            },
                            group: ['QD_kuroux_1'],
                            subSkill: {
                                1: {
                                    enable: 'phaseUse',
                                    prompt: '失去一点体力并增加一个回合',
                                    async content(event, trigger, player) {
                                        player.loseHp();
                                        player.storage.QD_kuroux++;
                                    },
                                    ai: {
                                        order: 3,
                                        result: {
                                            player(player, target, card) {
                                                if (player.storage.QD_kuroux > 0) {
                                                    return 0;
                                                }
                                                return player.hp + player.countCards('h', (c) => get.tag(c, 'recover')) - 1;
                                            }, //返回数字而不是true
                                        },
                                    },
                                },
                            },
                        },
                        涉猎: {
                            audio: 'shelie',
                            trigger: {
                                player: 'phaseDrawBegin1',
                            },
                            forced: true,
                            content() {
                                trigger.changeToZero();
                                let cards = [];
                                for (const i of lib.suits) {
                                    let card = get.cardPile2(function (card) {
                                        return card.suit == i;
                                    });
                                    if (card) {
                                        cards.push(card);
                                    }
                                }
                                if (cards.length) {
                                    player.gain(cards, 'gain2');
                                }
                            },
                        },
                        // 权计
                        // 当你体力变化/出牌阶段内不因使用而失去牌/出牌阶段外失去牌时,你摸一张牌,将一张牌称为<权>置于武将牌上
                        // 你的手牌上限+X(X为<权>的数量)
                        权计: {
                            trigger: {
                                player: ['changeHp', 'loseEnd'],
                            },
                            forced: true,
                            filter(event, player) {
                                if ('lose' == event.name) {
                                    if (event.getParent('权计', true)) {
                                        return false;
                                    }
                                    if (player == _status.currentPhase && event.getParent('phaseUse', true)) {
                                        return !['useCard', 'respond', 'equip'].includes(event.parent.name);
                                    }
                                }
                                return true;
                            },
                            async content(event, trigger, player) {
                                let count = Math.min(numberq1(trigger.num || trigger.cards?.length), 9);
                                while (count-- > 0) {
                                    await player.draw();
                                    if (player.countCards('he')) {
                                        const {
                                            result: { cards },
                                        } = await player.chooseCard('he', true, '选择一张牌作为<权>').set('ai', (c) => 6 - get.value(c));
                                        if (cards?.length) {
                                            player.addToExpansion(cards, 'giveAuto', player).gaintag.add('权计');
                                            if (player.getExpansions('权计').length > 2 && !player.hasSkill('排异')) {
                                                player.gainMaxHp();
                                                player.recover(2);
                                                player.draw(2);
                                                player.addSkill('排异');
                                            }
                                        }
                                    }
                                }
                            },
                            intro: {
                                content: 'expansion',
                                markcount: 'expansion',
                            },
                            mod: {
                                maxHandcard(player, num) {
                                    return num + player.getExpansions('权计').length;
                                },
                            },
                            ai: {
                                maixie: true,
                            },
                        },
                        排异: {
                            audio: 'xinpaiyi',
                            enable: 'phaseUse',
                            usable: 2,
                            filter(event, player) {
                                return player.getExpansions('权计').length;
                            },
                            async content(event, trigger, player) {
                                player.loseToDiscardpile(player.getExpansions('权计').randomGet());
                                if (!player.storage.排异) {
                                    player.draw(Math.max(1, player.getExpansions('权计').length));
                                } else {
                                    for (const npc of player.getEnemies()) {
                                        npc.damage();
                                    }
                                }
                                player.storage.排异 = !player.storage.排异;
                            },
                            ai: {
                                order: 1,
                                result: {
                                    player: 1,
                                },
                            },
                        },
                        拒战: {
                            trigger: {
                                target: ['useCardToPlayer'],
                            },
                            filter(event, player) {
                                return player != event.player;
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                player.draw();
                                trigger.player.draw();
                                trigger.player.addTempSkill('拒战_2');
                            },
                            group: ['拒战_1'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        player: ['useCardToPlayer'],
                                    },
                                    filter(event, player) {
                                        return player != event.target && event.target.countCards('he');
                                    },
                                    forced: true,
                                    async content(event, trigger, player) {
                                        player.gainPlayerCard(trigger.target, 'he', true);
                                    },
                                },
                                2: {
                                    mod: {
                                        playerEnabled(card, player, target) {
                                            if (target.hasSkill('拒战')) {
                                                return false;
                                            }
                                        },
                                    },
                                },
                            },
                        },
                        //当你对其他角色造成伤害时,你将伤害值改为其体力上限
                        夷灭: {
                            trigger: {
                                source: 'damageBefore',
                            },
                            filter(event, player) {
                                return player != event.player && event.num < event.player.maxHp;
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                trigger.num = trigger.player.maxHp;
                            },
                        },
                        泰然: {
                            trigger: {
                                player: ['phaseBefore', 'phaseAfter'],
                            },
                            forced: true,
                            filter(event, player) {
                                return [player.hp, player.countCards('h')].some((q) => q < player.maxHp);
                            },
                            async content(event, trigger, player) {
                                const num = player.maxHp;
                                if (num > player.hp) {
                                    player.recoverTo(num);
                                }
                                if (player.countCards('h') < num) {
                                    player.drawTo(num);
                                }
                            },
                            ai: {
                                effect: {
                                    player(card, player, target) {
                                        if (lib.card[card.name]) {
                                            if (player.getEquips('zhuge') && get.subtype(card) == 'equip1' && card.name != 'zhuge') {
                                                return -1;
                                            }
                                            return [1, 1.6]; //无脑用牌
                                        }
                                    },
                                },
                            },
                        },
                        // 游戏开始时,你获得游戏人数个<暴戾>,你对有<暴戾>的其他角色造成的伤害+x
                        // 任意角色濒死时,你获得<暴戾>
                        // 出牌阶段,你可以分配<暴戾>
                        // 你的手牌上限加全场<暴戾>数
                        // 有<暴戾>的其他角色的出牌阶段开始时,其随机执行x次以下项
                        // 火伤且本回合不能对你使用【杀】
                        // ②体流且永久扣减手牌上限
                        // ③令你获得其每个区域随机牌(x为其<暴戾>数)
                        QD_xionghuo: {
                            mark: true,
                            intro: {
                                content: 'mark',
                            },
                            init(player) {
                                player.addMark('QD_xionghuo', game.players.length);
                            },
                            mod: {
                                maxHandcard(player, num) {
                                    for (const i of game.players) {
                                        num += i.countMark('QD_xionghuo');
                                    }
                                    return num;
                                }, //QQQ
                            },
                            audio: 'xinfu_xionghuo',
                            enable: 'phaseUse',
                            filter(event, player) {
                                return player.countMark('QD_xionghuo') > 0;
                            },
                            filterTarget(card, player, target) {
                                return player != target;
                            },
                            async content(event, trigger, player) {
                                player.removeMark('QD_xionghuo', 1);
                                event.target.addMark('QD_xionghuo', 1);
                            },
                            ai: {
                                order: 11,
                                result: {
                                    target(player, target) {
                                        return target.countMark('QD_xionghuo') - 99;
                                    },
                                },
                                effect: {
                                    player(card, player, target) {
                                        if (
                                            player != target &&
                                            get.tag(card, 'damage') &&
                                            target &&
                                            target.hasMark('QD_xionghuo') &&
                                            !target.hasSkillTag('filterDamage', null, {
                                                player: player,
                                                card: card,
                                            })
                                        ) {
                                            return [1, 0, 1, -2 * target.countMark('QD_xionghuo')];
                                        }
                                    },
                                },
                                threaten: 1.6,
                            },
                            group: ['QD_xionghuo_1', 'QD_xionghuo_2', 'QD_xionghuo_3'],
                            subSkill: {
                                1: {
                                    audio: 'xinfu_xionghuo',
                                    logTarget: 'player',
                                    line: false,
                                    forced: true,
                                    trigger: {
                                        global: 'phaseUseBegin',
                                    },
                                    filter(event, player) {
                                        return event.player.countMark('QD_xionghuo') > 0 && !event.player.hasSkill('QD_xionghuo_1');
                                    },
                                    async content(event, trigger, player) {
                                        let count = trigger.player.countMark('QD_xionghuo');
                                        while (count-- > 0) {
                                            player.line(trigger.player, 'fire');
                                            const list = [1, 2];
                                            if (trigger.player.countCards('hej')) {
                                                list.push(3);
                                            }
                                            const Q = list.randomGet();
                                            if (Q == 1) {
                                                trigger.player.damage('fire');
                                                trigger.player.addTempSkill('QD_xionghuo_4');
                                                game.log('#g【凶镬1】');
                                            }
                                            if (Q == 2) {
                                                trigger.player.loseHp();
                                                trigger.player.addMark('QD_xionghuo_5');
                                                trigger.player.addSkill('QD_xionghuo_5');
                                                game.log('#g【凶镬2】');
                                            }
                                            if (Q == 3) {
                                                const cards = [];
                                                for (const pos of ['h', 'e', 'j']) {
                                                    const cardx = trigger.player.getCards(pos).randomGet();
                                                    if (cardx) {
                                                        cards.push(cardx);
                                                    }
                                                }
                                                if (cards.length) {
                                                    player.gain(cards, 'gain2');
                                                }
                                                game.log('#g【凶镬3】');
                                            }
                                        }
                                    },
                                },
                                2: {
                                    audio: 'xinfu_xionghuo',
                                    forced: true,
                                    trigger: {
                                        source: 'damageBefore',
                                    },
                                    filter(event, player) {
                                        return event.player.countMark('QD_xionghuo') > 0 && event.player != player;
                                    },
                                    async content(event, trigger, player) {
                                        trigger.num += trigger.player.countMark('QD_xionghuo');
                                    },
                                },
                                3: {
                                    audio: 'xinfu_xionghuo',
                                    trigger: {
                                        global: ['dyingBefore'],
                                    },
                                    forced: true,
                                    async content(event, trigger, player) {
                                        player.addMark('QD_xionghuo', 1);
                                    },
                                },
                                4: {
                                    mod: {
                                        playerEnabled(card, player, target) {
                                            if (target.skills.includes('QD_xionghuo')) {
                                                return false;
                                            }
                                        },
                                    },
                                    charlotte: true,
                                    mark: true,
                                    marktext: '禁',
                                    intro: {
                                        content: '不能对凶镬对象使用牌',
                                    },
                                },
                                5: {
                                    mod: {
                                        maxHandcard(player, num) {
                                            return num - player.countMark('QD_xionghuo_5');
                                        },
                                    },
                                    marktext: '减',
                                    mark: true,
                                    charlotte: true,
                                    intro: {
                                        content: '手牌上限-#',
                                    },
                                },
                            },
                        },
                        贵相: {
                            trigger: {
                                player: ['phaseBefore'],
                            },
                            forced: true,
                            firstDo: true,
                            async content(event, trigger, player) {
                                trigger.cancel();
                                let num = 6;
                                while (num-- > 0) {
                                    const stat = player.getStat();
                                    for (let i in stat.skill) {
                                        const info = lib.skill[i];
                                        if (info?.enable) {
                                            if ((typeof info.enable == 'string' && info.enable == 'phaseUse') || (typeof info.enable == 'object' && info.enable.includes('phaseUse'))) {
                                                stat.skill[i] = 0;
                                            }
                                        }
                                    }
                                    for (let i in stat.card) {
                                        const info = lib.card[i];
                                        if (info?.updateUsable == 'phaseUse') {
                                            stat.card[i] = 0;
                                        }
                                    }
                                    while (true) {
                                        const { result } = await player.chooseToUse().set('type', 'phase');
                                        if (result?.bool) {
                                        } else {
                                            break;
                                        } //QQQ
                                    }
                                }
                            },
                        },
                        //出牌阶段限一次,你可令手牌上限加一,将手牌摸到手牌上限
                        移荣: {
                            mod: {
                                maxHandcard(player, num) {
                                    return num + player.storage.移荣;
                                },
                            },
                            enable: 'phaseUse',
                            usable: 1,
                            mark: true,
                            intro: {
                                name: '手牌上限',
                                content: 'mark',
                            },
                            init(player) {
                                player.storage.移荣 = 0;
                            },
                            async content(event, trigger, player) {
                                player.addMark('移荣');
                                const num1 = player.countCards('h');
                                const num2 = player.getHandcardLimit();
                                if (num1 < num2) {
                                    player.draw(num2 - num1);
                                }
                            },
                            ai: {
                                order: 1,
                                result: {
                                    player: 1,
                                },
                                effect: {
                                    player(card, player, target) {
                                        if (lib.card[card.name]) {
                                            return [1, 1.6]; //无脑用牌
                                        }
                                    },
                                },
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————神吕布
                        //暴怒
                        //你登场时获得游戏人数个<暴怒>,每轮开始/受到伤害/造成伤害后,你从修罗兵器里面随机装备一个并获得等量<暴怒>
                        //修罗兵器:无双方天戟/修罗炼狱戟/玲珑狮蛮带/烈焰赤兔马/束发紫金冠
                        QD_baonu: {
                            mark: true,
                            intro: {
                                content: 'mark',
                            },
                            init(player) {
                                player.addMark('QD_baonu', game.players.length);
                            },
                            trigger: {
                                source: ['damage'],
                                player: ['damage'],
                                global: ['roundStart'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                const name = ['修罗炼狱戟', '无双方天戟', '玲珑', 'QD_chitu', 'shufazijinguan'].randomGet();
                                let card = get.cardPile((c) => c.name == name, 'field');
                                if (!card) {
                                    card = game.createCard(name);
                                }
                                player.equip(card);
                                player.addMark('QD_baonu', numberq1(trigger.num));
                            },
                        },
                        //神愤
                        //回合限一次,你可以弃置其他角色数枚<暴怒>,对所有其他角色造成一点伤害,令其翻面并弃置所有牌
                        QD_shenfen: {
                            enable: 'phaseUse',
                            usable: 1,
                            filter(event, player) {
                                return player.storage.QD_baonu >= game.players.length - 1;
                            },
                            async content(event, trigger, player) {
                                player.removeMark('QD_baonu', game.players.length - 1);
                                for (const npc of game.players.filter((q) => q != player)) {
                                    await npc.damage();
                                    await npc.turnOver(true);
                                    await npc.discard(npc.getCards('he'));
                                }
                            },
                            ai: {
                                order: 20,
                                result: {
                                    player: 1,
                                },
                            },
                        },
                        神威: {
                            trigger: {
                                player: 'phaseDrawBegin',
                            },
                            forced: true,
                            content() {
                                trigger.num += game.players.length;
                            },
                            mod: {
                                maxHandcard(player, current) {
                                    return current + game.players.length;
                                },
                            },
                        },
                        修罗炼狱戟: {
                            equipSkill: true,
                            trigger: {
                                source: ['damageBefore', 'damageEnd'],
                            },
                            _priority: 22,
                            forced: true,
                            async content(event, trigger, player) {
                                if (event.triggername == 'damageBefore') {
                                    trigger.num += Math.ceil(Math.max(trigger.player.maxHp, trigger.player.hp) / 3);
                                } else {
                                    trigger.player.recover(Math.floor(Math.min(trigger.player.maxHp, trigger.player.hp) / 4));
                                }
                            },
                            group: ['修罗炼狱戟_2'],
                            subSkill: {
                                2: {
                                    trigger: {
                                        player: ['useCard'],
                                    },
                                    filter(event, player) {
                                        return event.card && !['equip', 'delay'].includes(get.type(event.card)) && event.targets?.length;
                                    },
                                    _priority: 23,
                                    forced: true,
                                    async content(event, trigger, player) {
                                        if (get.effect(player, trigger.card, player, player) > 0) {
                                            trigger.excluded.addArray(player.getEnemies());
                                            trigger.targets.addArray(player.getFriends(true));
                                        } else {
                                            trigger.excluded.addArray(player.getFriends(true));
                                            trigger.targets.addArray(player.getEnemies());
                                        }
                                    },
                                },
                            },
                        },
                        无双方天戟: {
                            equipSkill: true,
                            trigger: {
                                player: ['useCardToPlayer'],
                            },
                            logTarget: 'target',
                            forced: true,
                            filter(event, player) {
                                return event.target != player;
                            },
                            async content(event, trigger, player) {
                                //QQQ
                                if (trigger.target.countCards('he')) {
                                    const { result } = await player
                                        .chooseControl('摸一张牌', '弃置目标的一张牌')
                                        .set('prompt', get.prompt('无双方天戟'))
                                        .set('ai', function () {
                                            if (get.attitude(player, trigger.target) > 0) {
                                                return 0;
                                            }
                                            if (get.effect(trigger.target, { name: 'guohe_copy2' }, player, player) > get.effect(player, { name: 'wuzhong' }, player, player) / 2) {
                                                return 1;
                                            }
                                            return 0;
                                        });
                                    if (result.index == 0) {
                                        player.draw();
                                    }
                                    if (result.index == 1) {
                                        await player.discardPlayerCard(trigger.target, 'he', true);
                                    }
                                } else {
                                    player.draw();
                                }
                            },
                            _priority: 50,
                        },
                        玲珑: {
                            trigger: {
                                target: ['useCardToPlayer'],
                            },
                            forced: true,
                            filter(event, player) {
                                _status.event.player = player;
                                return get.effect(player, event.card, event.player, player) < 0;
                            },
                            async content(event, trigger, player) {
                                const card = get.cards(1)[0];
                                game.cardsGotoOrdering(card);
                                player.showCards(card, '玲珑');
                                if (get.color(card) == 'red') {
                                    trigger.parent.excluded.add(player);
                                }
                            },
                        },
                        // 烈焰赤兔
                        // 你计算与其他角色的距离-2,其他角色计算与你的距离+1
                        // 当你使用/被使用【决斗】/【杀】时,摸一张牌
                        QD_chitu: {
                            trigger: {
                                target: ['useCardToPlayer'],
                                player: ['useCardToPlayer'],
                            },
                            filter(event, player) {
                                return ['juedou', 'sha'].includes(event.card.name);
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                player.draw();
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————沮授
                        矢北: {
                            marktext: '矢北',
                            mark: true,
                            intro: {
                                name: '矢北',
                                content: '本回合已受伤#次',
                            },
                            round: 1,
                            forced: true,
                            trigger: {
                                player: ['damage'],
                            },
                            content() {
                                player.recover(13);
                            },
                            group: ['矢北_1', '矢北_4'],
                            subSkill: {
                                1: {
                                    forced: true,
                                    trigger: {
                                        player: ['damageBegin4'],
                                    },
                                    content() {
                                        if (!player.storage.矢北) {
                                            player.storage.矢北 = 0;
                                        }
                                        player.storage.矢北++;
                                        trigger.num = player.storage.矢北;
                                    },
                                },
                                4: {
                                    forced: true,
                                    trigger: {
                                        global: ['phaseEnd'],
                                    },
                                    content() {
                                        player.storage.矢北 = 0;
                                    },
                                },
                            },
                        },
                        渐营: {
                            marktext: '渐营',
                            mark: true,
                            intro: {
                                name: '渐营',
                                content: '#',
                            },
                            round: 1,
                            forced: true,
                            trigger: {
                                player: ['useCard1', 'respond1'],
                            },
                            filter(event, player) {
                                if (!player.storage.渐营) {
                                    player.storage.渐营 = [];
                                }
                                return !player.storage.渐营.includes(event.card).number;
                            },
                            content() {
                                if (!player.storage.渐营) {
                                    player.storage.渐营 = [];
                                }
                                player.storage.渐营.add(trigger.card).number;
                            },
                            group: ['渐营_1'],
                            subSkill: {
                                1: {
                                    forced: true,
                                    trigger: {
                                        player: ['useCard2', 'respond2'],
                                    },
                                    filter(event, player) {
                                        return player.storage.渐营.includes(event.card).number;
                                    },
                                    content() {
                                        player.draw();
                                    },
                                },
                            },
                        },
                        释怀: {
                            mod: {
                                aiValue(player, card, num) {
                                    if (get.type(card) == 'equip') {
                                        return 99;
                                    }
                                },
                                aiUseful(player, card, num) {
                                    if (get.type(card) == 'equip') {
                                        return 99;
                                    }
                                },
                            },
                            trigger: {
                                player: ['useCardToPlayer'],
                            },
                            marktext: '武',
                            intro: {
                                content: 'expansion',
                                markcount: 'expansion',
                            },
                            forced: true,
                            filter(event, player, card) {
                                if (!get.info(event.card).skills) {
                                    return false;
                                }
                                return event.target == player && get.type(event.card) == 'equip';
                            },
                            content() {
                                player.addToExpansion(trigger.cards, 'gain2').gaintag.add('释怀');
                                player.addAdditionalSkill('释怀' + Math.random(), get.info(trigger.card).skills, true);
                            },
                            ai: {
                                effect: {
                                    player(card, player) {
                                        if (get.type(card) == 'equip') {
                                            return [3, 3];
                                        }
                                    },
                                },
                            },
                        },
                        QD_ranshang: {
                            trigger: {
                                player: 'damageEnd',
                            },
                            filter: (event, player) => event.hasNature('fire'),
                            forced: true,
                            async content(event, trigger, player) {
                                //QQQ
                                player.addMark('QD_ranshang', trigger.num);
                            },
                            intro: {
                                name2: '燃',
                                content: 'mark',
                            },
                            ai: {
                                neg: true,
                                effect: {
                                    target(card, player, target, current) {
                                        if (card.name == 'sha') {
                                            if (game.hasNature(card, 'fire') || player.hasSkill('zhuque_skill')) {
                                                return 2;
                                            }
                                        }
                                        if (get.tag(card, 'fireDamage') && current < 0) {
                                            return 2;
                                        }
                                    },
                                },
                            },
                            group: ['QD_ranshang_1', 'QD_ranshang_2', 'QD_ranshang_3', 'QD_ranshang_4'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        player: 'phaseJieshuBegin',
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return player.countMark('QD_ranshang');
                                    },
                                    async content(event, trigger, player) {
                                        //QQQ
                                        player.damage(player.countMark('QD_ranshang'), 'fire');
                                    },
                                },
                                2: {
                                    trigger: {
                                        target: ['useCardToBefore', 'shaBegin'],
                                    },
                                    forced: true,
                                    priority: 6,
                                    filter(event, player, name) {
                                        if (name == 'shaBegin') {
                                            return !game.hasNature(event.card);
                                        }
                                        return event.targets.length > 1;
                                    },
                                    async content(event, trigger, player) {
                                        //QQQ
                                        trigger.cancel();
                                    },
                                    ai: {
                                        effect: {
                                            target(card, player, target, current) {
                                                if (lib.card[card.name] && game.xunshi(card)) {
                                                    return 'zerotarget';
                                                } //QQQ
                                                if (card.name == 'sha') {
                                                    const equip1 = player.getEquip('zhuque');
                                                    if (equip1 && equip1.name == 'zhuque') {
                                                        return 1.9;
                                                    }
                                                    if (!game.hasNature(card)) {
                                                        return 'zerotarget';
                                                    }
                                                }
                                            },
                                        },
                                    },
                                },
                                3: {
                                    trigger: {
                                        player: 'damageBegin3',
                                    },
                                    filter: (event, player) => event.hasNature('fire'),
                                    forced: true,
                                    async content(event, trigger, player) {
                                        //QQQ
                                        trigger.num = trigger.num * 2 || 2;
                                    },
                                    ai: {
                                        fireAttack: true,
                                        effect: {
                                            target(card, player, target, current) {
                                                if (card.name == 'sha') {
                                                    if (game.hasNature(card, 'fire')) {
                                                        return 2;
                                                    }
                                                    if (player.hasSkill('zhuque_skill')) {
                                                        return 1.9;
                                                    }
                                                }
                                                if (get.tag(card, 'fireDamage') && current < 0) {
                                                    return 2;
                                                }
                                            },
                                        },
                                    },
                                },
                                4: {
                                    trigger: {
                                        global: ['roundStart'],
                                    },
                                    forced: true,
                                    filter: (event, player) => game.roundNumber > 10,
                                    async content(event, trigger, player) {
                                        //QQQ
                                        game.over(player.getFriends(true).includes(game.me));
                                    },
                                },
                            },
                        },
                        QD_luanwu: {
                            enable: 'phaseUse',
                            usable: 1,
                            charlotte: true,
                            fixed: true,
                            async content(event, trigger, player) {
                                const list = player.qcard(false, false).filter((q) => get.tag({ name: q[2] }, 'damage'));
                                let num = 20;
                                while (num-- > 0) {
                                    const w = {};
                                    for (const i of game.players.filter((q) => q != player)) {
                                        w[i.name] = i.hp;
                                    }
                                    for (const i of game.players) {
                                        const { result } = await i.chooseButton(['视为使用无距离限制的杀或者伤害类锦囊', [list, 'vcard']]).set('ai', (button) => {
                                            const num = i.getUseValue(
                                                {
                                                    name: button.link[2],
                                                    nature: button.link[3],
                                                },
                                                null,
                                                true
                                            );
                                            return number0(num) + 10;
                                        });
                                        if (result && result.links && result.links[0]) {
                                            await i.chooseUseTarget(
                                                {
                                                    suit: result.links[0][0],
                                                    number: result.links[0][1],
                                                    name: result.links[0][2],
                                                    nature: result.links[0][3],
                                                },
                                                true,
                                                false,
                                                'nodistance'
                                            );
                                        }
                                    }
                                    if (game.players.filter((q) => q != player).every((q) => q.hp < w[q.name])) {
                                        break;
                                    }
                                }
                            },
                            ai: {
                                order: 10,
                                result: {
                                    player: 1,
                                },
                            },
                        },
                        QD_weimu: {
                            mod: {
                                targetEnabled(card) {
                                    if (get.color(card) == 'black') {
                                        return false;
                                    }
                                },
                            },
                            init(player) {
                                let qmaxhp = 4;
                                Reflect.defineProperty(player, 'maxHp', {
                                    get() {
                                        return qmaxhp;
                                    },
                                    set(value) {
                                        if (this != _status.currentPhase) {
                                            qmaxhp = value;
                                        } else {
                                            if (value > qmaxhp) {
                                                qmaxhp = value;
                                            }
                                            this.draw(2 * Math.abs(qmaxhp - value));
                                        }
                                    },
                                });
                                let qhp = 4;
                                Reflect.defineProperty(player, 'hp', {
                                    get() {
                                        return qhp;
                                    },
                                    set(value) {
                                        if (this == _status.currentPhase || (_status.event.parent && _status.event.parent.source == this)) {
                                            if (value > qhp) {
                                                qhp = value;
                                            }
                                            this.draw(2 * Math.abs(qhp - value));
                                        } else {
                                            qhp = value;
                                        }
                                    },
                                });
                            },
                            ai: {
                                effect: {
                                    target(card, player, target) {
                                        if (target == _status.currentPhase && get.tag(card, 'damage')) {
                                            return [0, 1];
                                        }
                                    },
                                },
                            },
                        },
                        QD_wansha: {
                            trigger: {
                                global: ['changeHp'],
                            },
                            silent: true,
                            async content(event, trigger, player) {
                                trigger.player.storage.QD_wansha = numberq0(trigger.player.storage.QD_wansha) + 1;
                                if (trigger.player.storage.QD_wansha > 1) {
                                    trigger.player.storage.QD_wansha -= 2;
                                    await player.useCard({ name: 'sha' }, trigger.player, false);
                                }
                            },
                            group: ['QD_wansha_1'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        source: 'damageBefore',
                                    },
                                    filter: (event, player) => event.player.hp <= player.hp,
                                    silent: true,
                                    async content(event, trigger, player) {
                                        trigger.num = numberq1(trigger.num) * 2;
                                    },
                                },
                            },
                        },
                        贞烈: {
                            audio: 'ext:缺德扩展/audio:1',
                            trigger: {
                                target: ['useCardToPlayer'],
                            },
                            filter(event, player) {
                                return event.player != player && event.card;
                            },
                            check(event, player) {
                                const evt = event.parent;
                                if (evt.excluded.includes(player)) {
                                    return false;
                                }
                                if (event.player.isFriendsOf(player)) {
                                    return false;
                                }
                                if (get.effect(player, event.card, event.player, player) > 0) {
                                    return false;
                                }
                                if ((evt.nowuxie && get.type(event.card) == 'trick') || (evt.directHit && evt.directHit.includes(player)) || (evt.customArgs && evt.customArgs.default && evt.customArgs.default.directHit2)) {
                                    return true;
                                }
                                if (get.tag(event.card, 'respondSha') && player.hasCard((c) => c.name == 'sha', 'h')) {
                                    return false;
                                } else if (get.tag(event.card, 'respondShan') && player.hasCard((c) => c.name == 'shan', 'h')) {
                                    return false;
                                }
                                return true;
                            },
                            logTarget: 'player',
                            async content(event, trigger, player) {
                                await player.loseHp();
                                trigger.parent.excluded.add(player);
                                const list = new Map();
                                let num = player.getDamagedHp();
                                while (num > 0) {
                                    const {
                                        result: { targets },
                                    } = await player
                                        .chooseTarget(`获得任意名角色区域内的${num}张牌`, (card, player, target) => {
                                            return (
                                                target != player &&
                                                target.hasCard((c) => {
                                                    const discarded = list.get(target);
                                                    if (discarded?.includes(c)) {
                                                        return false;
                                                    }
                                                    return lib.filter.canBeGained(c, player, target, 'dcluochong');
                                                }, 'hej')
                                            );
                                        })
                                        .set('ai', (target) => {
                                            const discarded = list.get(target);
                                            if (discarded?.length >= target.countCards('he')) {
                                                return 0;
                                            }
                                            return get.effect(target, { name: 'shunshou' }, player, player);
                                        });
                                    if (targets?.length) {
                                        const {
                                            result: { cards },
                                        } = await player
                                            .choosePlayerCard(targets[0], true, 'hej', [1, num], `选择获得${get.translation(targets[0])}区域内的牌`)
                                            .set('filterButton', (button) => {
                                                const discarded = list.get(targets[0]);
                                                if (discarded?.includes(button.link)) {
                                                    return false;
                                                }
                                                return lib.filter.canBeGained(button.link, player, targets[0], 'dcluochong');
                                            })
                                            .set('ai', (button) => {
                                                if (ui.selected.buttons.length > 0) {
                                                    return false;
                                                } //一次进行一张牌的ai计算
                                                return get.value(button.link, targets[0]) * -get.attitude(player, targets[0]);
                                            });
                                        if (cards?.length) {
                                            num -= cards.length;
                                            const discarded = list.get(targets[0]);
                                            if (!discarded) {
                                                list.set(targets[0], cards);
                                            } else {
                                                discarded.addArray(cards);
                                            }
                                        }
                                    } else {
                                        break;
                                    }
                                }
                                if (num > 0) {
                                    await player.draw(num);
                                }
                                if (list.size) {
                                    for (const [target, cards] of list) {
                                        await target.give(cards, player);
                                    }
                                }
                            },
                            ai: {
                                maixie: true,
                            },
                        },
                        QD_shuangjia: {
                            init(player) {
                                player.storage.QD_shuangjia = Array.from(ui.cardPile.childNodes).slice(0, 4);
                            },
                            mod: {
                                globalTo(from, to, distance) {
                                    return distance + to.countCards('h', (card) => to.storage.QD_shuangjia.includes(card));
                                },
                                cardUsable(card, player) {
                                    return Infinity;
                                },
                                targetInRange(card, player) {
                                    return true;
                                },
                            },
                            mark: true,
                            intro: {
                                name: '霜笳',
                                content: 'cards',
                                mark(dialog, storage, player) {
                                    dialog.addSmall(player.storage.QD_shuangjia);
                                },
                            },
                            trigger: {
                                player: ['loseBegin'],
                            },
                            filter(event, player) {
                                return event.cards && event.cards.some((q) => player.storage.QD_shuangjia.includes(q));
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                for (const card of trigger.cards.filter((q) => player.storage.QD_shuangjia.includes(q))) {
                                    const cards = [];
                                    const suits = lib.suits.filter((q) => q != card.suit);
                                    for (const suit of suits) {
                                        const cardx = get.cardPile((c) => c.suit == suit);
                                        if (cardx) {
                                            cards.push(cardx);
                                        }
                                    }
                                    if (cards.length) {
                                        await player.gain(cards, 'gain2'); //不await的话两次都会检索同一批牌
                                    }
                                }
                            },
                            ai: {
                                effect: {
                                    player(card, player, target) {
                                        if (player.storage.QD_shuangjia.includes(card)) {
                                            return [0, 5];
                                        }
                                    },
                                },
                            }, //QQQ
                            group: ['QD_shuangjia_1'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        global: ['phaseBegin'],
                                    },
                                    forced: true,
                                    async content(event, trigger, player) {
                                        if (!player.storage.QD_shuangjia || player.storage.QD_shuangjia.length < 4) {
                                            player.storage.QD_shuangjia = Array.from(ui.cardPile.childNodes).slice(0, 4);
                                        }
                                        player.gain(player.storage.QD_shuangjia, 'gain2').gaintag = ['QD_shuangjia'];
                                    },
                                },
                            },
                        },
                        连诛: {
                            trigger: {
                                player: ['damageEnd'],
                                global: ['roundStart'],
                            },
                            forced: true,
                            filter(event, player) {
                                return player.countCards('he') && game.hasPlayer((current) => current != player);
                            },
                            async content(event, trigger, player) {
                                const { result } = await player.chooseCardTarget({
                                    prompt: '将一张牌交给一名其他角色,并获得+1效果',
                                    filterCard: true,
                                    forced: true,
                                    filterTarget: (card, player, target) => target != player,
                                    position: 'he',
                                    source: trigger.source,
                                    ai1(card) {
                                        if (player.getFriends().length && get.color(card) == 'red') {
                                            return 10 - get.value(card);
                                        }
                                        if (get.color(card) == 'black') {
                                            return 20 - get.value(card);
                                        }
                                        return 0;
                                    },
                                    ai2(target) {
                                        let card = ui.selected.cards[0];
                                        if (get.color(card) == 'red') {
                                            return get.attitude(player, target);
                                        }
                                        if (get.color(card) == 'black') {
                                            return -get.attitude(player, target);
                                        }
                                    },
                                });
                                if (result.bool) {
                                    player.give(result.cards, result.targets[0]);
                                    player.addMark('连诛_mark');
                                    player.addSkill('连诛_mark');
                                }
                            },
                            subSkill: {
                                mark: {
                                    trigger: {
                                        player: 'phaseDrawBegin2',
                                    },
                                    forced: true,
                                    charlotte: true,
                                    popup: false,
                                    filter(event, player) {
                                        return !event.numFixed;
                                    },
                                    content() {
                                        trigger.num += player.countMark('连诛_mark');
                                    },
                                    mod: {
                                        maxHandcard(player, num) {
                                            return num + player.countMark('连诛_mark');
                                        },
                                        cardUsable(card, player, num) {
                                            if (card.name == 'sha') {
                                                return num + player.countMark('连诛_mark');
                                            }
                                        },
                                    },
                                    intro: {
                                        content: '拥有#层效果',
                                    },
                                },
                            },
                        },
                        黠慧: {
                            mod: {
                                ignoredHandcard(card, player) {
                                    if (get.color(card) == 'black') {
                                        return true;
                                    }
                                },
                            },
                            trigger: {
                                global: 'gainBefore',
                            },
                            forced: true,
                            filter: (event, player) => event.player != player && event.cards && event.cards.some((q) => player.getCards('he').includes(q)),
                            async content(event, trigger, player) {
                                for (const i of trigger.cards) {
                                    if (player.getCards('he').includes(i)) {
                                        if (get.color(i) == 'red') {
                                            player.draw();
                                            const { result } = await player.chooseBool(`令${get.translation(trigger.player)}回复1点体力`).set('ai', () => get.recoverEffect(trigger.player, player, player));
                                            if (result.bool) {
                                                trigger.player.recover();
                                            }
                                        } else {
                                            trigger.player.addMark('黠慧_1');
                                            trigger.player.addSkill('黠慧_1');
                                            trigger.player.addSkill('黠慧_2');
                                            i.storage.黠慧 = true;
                                            player.draw(2);
                                        }
                                    }
                                }
                            },
                            subSkill: {
                                1: {
                                    trigger: {
                                        player: 'damageBefore',
                                    },
                                    forced: true,
                                    charlotte: true,
                                    filter(event, player) {
                                        return event.card && event.card.name == 'sha';
                                    },
                                    content() {
                                        trigger.num += player.countMark('黠慧_1');
                                        player.storage.黠慧_1 = 0;
                                        player.removeSkill('黠慧_1');
                                    },
                                    intro: {
                                        content: '下一次受到杀的伤害+#',
                                    },
                                },
                                2: {
                                    mark: true,
                                    intro: {
                                        content: '不能使用、打出或弃置获得的黑色牌',
                                    },
                                    mod: {
                                        cardDiscardable(card, player) {
                                            if (card.storage && card.storage.黠慧) {
                                                return false;
                                            }
                                        },
                                        canBeDiscarded(card) {
                                            if (card.storage && card.storage.黠慧) {
                                                return false;
                                            }
                                        },
                                        canBeGained(card) {
                                            if (card.storage && card.storage.黠慧) {
                                                return false;
                                            }
                                        },
                                        cardEnabled2(card, player) {
                                            if (card.storage && card.storage.黠慧) {
                                                return false;
                                            }
                                        },
                                    },
                                    forced: true,
                                    popup: false,
                                    charlotte: true,
                                },
                            },
                        },
                        //观星
                        //每回合开始时,观看牌堆顶七张牌,并任意将这些牌置于牌堆顶或牌堆底
                        QD_guanxing: {
                            audio: 'guanxing',
                            audioname: ['jiangwei', 're_jiangwei', 're_zhugeliang', 'gexuan', 'ol_jiangwei'],
                            trigger: {
                                global: ['phaseBegin'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                //QQQ
                                const num = 7;
                                const cardx = get.cards(num);
                                game.cardsGotoOrdering(cardx);
                                const {
                                    result: { moved },
                                } = await player
                                    .chooseToMove()
                                    .set('list', [['牌堆顶', cardx], ['牌堆底']])
                                    .set('prompt', '将牌移动到牌堆顶或牌堆底')
                                    .set('processAI', function (list) {
                                        const cards = list[0][1];
                                        const target = trigger.player;
                                        const att = get.attitude(player, target);
                                        const top = [], bottom = cards;
                                        for (const i of target.getCards('j')) {
                                            const judge = get.judge(i);
                                            bottom.sort((a, b) => (judge(b) - judge(a)) * att); //态度大于0价值高的牌放前面
                                            if (bottom.length) {
                                                top.push(bottom.shift());
                                            }
                                        }
                                        bottom.sort((a, b) => (get.value(b) - get.value(a)) * att); //态度大于0价值高的牌放前面
                                        while (bottom.length) {
                                            top.push(bottom.shift());
                                        }
                                        return [top, bottom];
                                    }); //给别人观星
                                if (moved?.length) {
                                    moved[0].reverse();
                                    for (const i of moved[0]) {
                                        ui.cardPile.insertBefore(i, ui.cardPile.firstChild);
                                    }
                                    for (const i of moved[1]) {
                                        ui.cardPile.appendChild(i);
                                    }
                                    game.log(`${get.translation(moved[0])}上${get.translation(moved[1])}下`);
                                }
                            },
                        },
                        QD_guanxing1: {
                            _priority: 35,
                            trigger: {
                                player: 'phaseZhunbeiBegin',
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                //QQQ
                                const cardx = get.cards(20);
                                game.cardsGotoOrdering(cardx);
                                const {
                                    result: { moved },
                                } = await player
                                    .chooseToMove()
                                    .set('list', [['牌堆顶', cardx], ['牌堆底']])
                                    .set('prompt', '将牌移动到牌堆顶或牌堆底')
                                    .set('processAI', function (list) {
                                        const cards = list[0][1];
                                        const top = [], bottom = cards;
                                        for (const i of player.getCards('j')) {
                                            const judge = get.judge(i);
                                            bottom.sort((a, b) => (judge(b) - judge(a))); //价值高的牌放前面
                                            if (bottom.length) {
                                                top.push(bottom.shift());
                                            }
                                        }
                                        bottom.sort((a, b) => (get.value(b) - get.value(a))); //把价值高的牌放前面
                                        while (bottom.length) {
                                            top.push(bottom.shift());
                                        }
                                        return [top, bottom];
                                    }); //自己观星
                                if (moved?.length) {
                                    moved[0].reverse();
                                    for (const i of moved[0]) {
                                        ui.cardPile.insertBefore(i, ui.cardPile.firstChild);
                                    }
                                    for (const i of moved[1]) {
                                        ui.cardPile.appendChild(i);
                                    }
                                    game.log(`${get.translation(moved[0])}上${get.translation(moved[1])}下`);
                                }
                            },
                        },
                        //空城
                        //①若你手牌只有一种类型,你不能成为伤害牌的目标②回合结束时,若你手牌只有一种类型,则取消①中的条件直至你回合开始
                        QD_kongcheng: {
                            mod: {
                                targetEnabled(card, player, target, now) {
                                    if (get.tag(card, 'damage')) {
                                        if (
                                            target.storage.QD_kongcheng ||
                                            target
                                                .getCards('h')
                                                .map((q) => get.type(q))
                                                .unique().length < 2
                                        ) {
                                            return false;
                                        }
                                    }
                                },
                            },
                            trigger: {
                                player: ['phaseEnd'],
                            },
                            forced: true,
                            mark: true,
                            intro: {
                                content(storage, player) {
                                    if (
                                        player.storage.QD_kongcheng ||
                                        player
                                            .getCards('h')
                                            .map((q) => get.type(q))
                                            .unique().length < 2
                                    ) {
                                        return '空城生效';
                                    }
                                    return '空城无效';
                                },
                            },
                            filter(event, player) {
                                return (
                                    player
                                        .getCards('h')
                                        .map((q) => get.type(q))
                                        .unique().length < 2
                                );
                            },
                            async content(event, trigger, player) {
                                player.storage.QD_kongcheng = true;
                                player.when({ player: 'phaseBegin' }).then(() => (player.storage.QD_kongcheng = false));
                            },
                        },
                        给橘: {
                            trigger: {
                                player: 'phaseUseBegin',
                            },
                            forced: true,
                            content() {
                                'step 0';
                                player.chooseTarget(get.prompt('给橘'), '移去一个【橘】或失去1点体力,令一名其他角色获得一个【橘】', function (card, player, target) {
                                    return target != player && target.isFriendsOf(player);
                                });
                                ('step 1');
                                if (result.bool) {
                                    event.target = result.targets[0];
                                    if (player.hasMark('橘')) {
                                        player
                                            .chooseControl()
                                            .set('choiceList', ['流失一点体力', '移去一个<橘>'])
                                            .set('ai', function () {
                                                if (player.hp > 3) {
                                                    return 0;
                                                }
                                                return 1;
                                            });
                                    } else {
                                        event._result = { index: 0 };
                                    }
                                } else {
                                    event.finish();
                                }
                                ('step 2');
                                if (result.index == 1) {
                                    player.removeMark('橘', 1);
                                } else {
                                    player.loseHp();
                                }
                                target.addMark('橘', 2);
                            },
                        },
                        橘: {
                            init(player) {
                                player.addMark('橘', 6);
                            },
                            marktext: '橘',
                            mark: true,
                            intro: {
                                name: '橘',
                                content: '当前有#个<橘>',
                            },
                            audio: 'nzry_huaiju',
                            trigger: {
                                global: ['damageBegin4', 'phaseDrawBegin2'],
                            },
                            forced: true,
                            filter(event, player) {
                                return event.player.hasMark('橘') && (event.name == 'damage' || !event.numFixed);
                            },
                            content() {
                                player.line(trigger.player, 'green');
                                if (trigger.name == 'damage') {
                                    trigger.cancel();
                                    trigger.player.removeMark('橘', 1);
                                } else {
                                    trigger.num += 2;
                                }
                            },
                            group: ['橘_1'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        player: 'phaseDrawBefore',
                                    },
                                    forced: true,
                                    content() {
                                        player.addMark('橘', 2);
                                    },
                                },
                            },
                        },
                        // 雷击
                        // 当一名角色回合外使用或打出牌时,你进行一次判定
                        // 当一名角色判定结束后,若结果为:♠️️️,你对一名角色造成2点雷电伤害;♣️️️,你回复1点体力并对一名角色造成1点雷电伤害
                        QD_leiji: {
                            audio: 'xinleiji',
                            trigger: {
                                global: ['judgeEnd'],
                            },
                            forced: true,
                            filter(event, player) {
                                return ['spade', 'club'].includes(event.result.suit);
                            },
                            async content(event, trigger, player) {
                                const num = 1 + ['club', 'spade'].indexOf(trigger.result.suit);
                                if (num == 1 && player.isDamaged()) {
                                    player.recover();
                                }
                                const {
                                    result: { targets },
                                } = await player.chooseTarget(`对一名角色造成${num}点雷电伤害`, lib.filter.notMe).set('ai', (t) => sgn(t.isEnemiesOf(player)));
                                if (targets?.length) {
                                    targets[0].damage(num, 'thunder');
                                }
                            },
                            group: ['QD_leiji_1'],
                            subSkill: {
                                1: {
                                    audio: 'xinleiji',
                                    trigger: {
                                        global: ['useCard', 'respond'],
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return event.player != _status.currentPhase && !event.getParent('鬼道', true);
                                    },
                                    async content(event, trigger, player) {
                                        player.judge(function (card) {
                                            if (card.suit == 'spade') {
                                                return 4;
                                            }
                                            if (card.suit == 'club') {
                                                return 3;
                                            }
                                            return 0;
                                        });
                                    },
                                },
                            },
                        },
                        鬼道: {
                            trigger: {
                                global: ['judge'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                player.draw('nodelay');
                                const { result } = await player.chooseCard(get.translation(trigger.player) + '的' + (trigger.judgestr || '') + `判定为${get.translation(trigger.player.judging[0])},` + get.prompt('xinguidao'), 'hes').set('ai', function (card) {
                                    let result = (trigger.judge(card) - trigger.judge(trigger.player.judging[0])) * sgn(get.attitude(player, trigger.player));
                                    if (card.suit == 'spade') {
                                        result += 4;
                                    }
                                    if (card.suit == 'club') {
                                        result += 3;
                                    }
                                    result += 1;
                                    return result;
                                });
                                if (result.cards && result.cards[0]) {
                                    player.respond(result.cards, 'highlight', 'xinguidao', 'noOrdering');
                                    player.gain(trigger.player.judging[0]);
                                    trigger.player.judging[0] = result.cards[0];
                                    trigger.orderingCards.push(result.cards[0]);
                                    game.log(trigger.player, '的判定牌改为', result.cards[0]);
                                }
                            },
                            ai: {
                                rejudge: true,
                                tag: {
                                    rejudge: 1,
                                },
                            },
                        },
                        QD_wangzun: {
                            trigger: {
                                global: 'phaseZhunbeiBegin',
                            },
                            audio: 'wangzun',
                            filter(event, player) {
                                return event.player != player;
                            },
                            check: (event, player) => event.player.isEnemiesOf(player),
                            logTarget: 'player',
                            async content(event, trigger, player) {
                                player.draw();
                                trigger.player.addTempSkill('QD_wangzun_1');
                            },
                            subSkill: {
                                1: {
                                    mod: {
                                        maxHandcard(player, num) {
                                            return num - 3;
                                        },
                                        playerEnabled(card, player, target) {
                                            const q = game.players.find((i) => i.hasSkill('QD_wangzun'));
                                            if (q) {
                                                if (target != q) {
                                                    return false;
                                                }
                                            }
                                        },
                                        targetEnabled(card, player, target) {
                                            const q = game.players.find((i) => i.hasSkill('QD_wangzun'));
                                            if (q) {
                                                if (target != q) {
                                                    return false;
                                                }
                                            }
                                        },
                                    },
                                    mark: true,
                                    intro: {
                                        content(storage, player) {
                                            const q = game.players.find((i) => i.hasSkill('QD_wangzun'));
                                            if (q) {
                                                return `手牌上限减三且本回合只能对${get.translation(q)}使用牌`;
                                            }
                                        },
                                    },
                                },
                            },
                        },
                        // 弃牌阶段开始时,你翻面并弃置所有手牌
                        据守: {
                            audio: 'sbjushou',
                            trigger: {
                                player: ['phaseDiscardBefore'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                await player.turnOver();
                                player.discard(player.getCards('h'));
                            },
                            group: ['据守_1', '据守_2'],
                            subSkill: {
                                // 当你翻面时,摸等同于<护甲>值的牌
                                1: {
                                    trigger: {
                                        player: ['turnOverEnd'],
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return player.hujia > 0;
                                    },
                                    async content(event, trigger, player) {
                                        player.draw(player.hujia);
                                    },
                                },
                                // 当你<出牌阶段外失去牌/出牌阶段内不因使用而失去牌>时,获得等量的<护甲>
                                2: {
                                    trigger: {
                                        player: ['loseEnd'],
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        if (player == _status.currentPhase && event.getParent('phaseUse', true)) {
                                            return !['useCard', 'respond', 'equip'].includes(event.parent.name);
                                        }
                                        return event.cards?.length;
                                    },
                                    async content(event, trigger, player) {
                                        player.changeHujia(trigger.cards.length);
                                    },
                                },
                            },
                        },
                        安国: {
                            audio: 'anguo',
                            enable: 'phaseUse',
                            usable: 2,
                            filterTarget(card, player, target) {
                                return player != target;
                            },
                            async content(event, trigger, player) {
                                event.target.draw();
                                event.target.recover();
                                const equip1 = Array.from(ui.cardPile.childNodes)
                                    .filter((Q) => get.type(Q) == 'equip' && event.target.canEquip(Q))
                                    .randomGet();
                                if (equip1) {
                                    event.target.equip(equip1, 'gain2');
                                }
                                player.draw();
                                player.recover();
                                const equip2 = Array.from(ui.cardPile.childNodes)
                                    .filter((Q) => get.type(Q) == 'equip' && player.canEquip(Q))
                                    .randomGet();
                                if (equip2) {
                                    player.equip(equip2, 'gain2');
                                } //QQQ
                            },
                            ai: {
                                threaten: 1.6,
                                order: 9,
                                result: {
                                    target(player, target) {
                                        if (get.attitude(player, target) <= 0) {
                                            if (target.isMinHandcard() || target.isMinEquip() || target.isMinHp()) {
                                                return 4;
                                            }
                                        }
                                        let num = 1;
                                        if (target.isMinHandcard()) {
                                            num += 2;
                                        }
                                        if (target.isMinEquip()) {
                                            num += 2;
                                        }
                                        if (target.isDamaged()) {
                                            num += 4;
                                        }
                                        return num;
                                    },
                                },
                            },
                        },
                        复难: {
                            trigger: {
                                global: ['respond', 'useCard'],
                            },
                            forced: true,
                            filter(event, player) {
                                if (!event.respondTo) {
                                    return false;
                                }
                                if (event.player == player) {
                                    return false;
                                }
                                if (player != event.respondTo[0]) {
                                    return false;
                                } else {
                                    return event.cards.filterInD('od').length;
                                }
                            },
                            logTarget: 'player',
                            content() {
                                let cards = trigger.cards.filterInD('od');
                                player.gain(cards, 'log', 'gain2');
                            },
                        },
                        慷忾: {
                            trigger: {
                                global: ['useCardToPlayer'],
                            },
                            check(event, player) {
                                return get.attitude(player, event.target) > 0;
                            },
                            filter(event, player) {
                                return event.player != event.target;
                            },
                            logTarget: 'target',
                            async content(event, trigger, player) {
                                player.draw(2);
                                if (trigger.target != player) {
                                    const {
                                        result: { cards },
                                    } = await player.chooseCard(true, 'h', `交给${get.translation(trigger.target)}一张牌`).set('ai', function (card) {
                                        if (get.type(card) == 'equip') {
                                            return 2;
                                        }
                                        if (get.type(card) == 'basic') {
                                            return 1;
                                        }
                                        return 0;
                                    });
                                    if (cards && cards[0]) {
                                        player.give(cards, trigger.target, 'give');
                                        if (get.type(cards[0]) == 'equip') {
                                            trigger.target.equip(cards[0]);
                                        }
                                    }
                                }
                            },
                            ai: {
                                threaten: 1.1,
                            },
                        },
                        恩怨: {
                            trigger: {
                                player: ['changeHp'],
                                global: ['roundStart'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                let count = Math.min(numberq1(trigger.num), 9);
                                while (count-- > 0) {
                                    const { result } = await player.chooseTarget(get.prompt('恩怨'), (card, player, target) => target != player).set('ai', (target) => -get.attitude(player, target));
                                    if (result.targets && result.targets[0]) {
                                        result.targets[0].loseHp();
                                        player.gainPlayerCard(result.targets[0], 'hej', true);
                                        player.draw();
                                    }
                                }
                            },
                            ai: {
                                maixie: true,
                            },
                        },
                        突袭: {
                            trigger: {
                                player: 'drawBefore',
                            },
                            forced: true,
                            filter(event, player) {
                                return game.hasPlayer((q) => q.countCards('he') && q.isEnemiesOf(player));
                            },
                            async content(event, trigger, player) {
                                while (trigger.num > 0 && game.hasPlayer((q) => q.countCards('he') && q.isEnemiesOf(player))) {
                                    const {
                                        result: { targets },
                                    } = await player.chooseTarget('获得其他角色的牌', (c, p, t) => t.countCards('he') && t.isEnemiesOf(p)).set('ai', (target) => -get.attitude(player, target));
                                    if (targets && targets[0]) {
                                        const {
                                            result: { links },
                                        } = await player.gainPlayerCard(targets[0], 'he', [1, trigger.num]);
                                        if (links?.length) {
                                            trigger.num -= links.length;
                                        } else {
                                            break;
                                        }
                                    } else {
                                        break;
                                    }
                                }
                            },
                        },
                        镇卫: {
                            audioname: ['re_wenpin'],
                            trigger: {
                                global: ['useCardToPlayer'],
                            },
                            filter(event, player) {
                                if (player == event.target || player == event.player) {
                                    return false;
                                }
                                if (event.targets.length > 1) {
                                    return false;
                                }
                                return event.target != event.player;
                            },
                            check(event, player) {
                                return get.effect(event.target, event.card, event.player, player) < 0;
                            },
                            content() {
                                'step 0';
                                player
                                    .chooseControl('转移', '失效', function () {
                                        if (get.effect(trigger.target, trigger.card, trigger.player, player) < -6) {
                                            return '失效';
                                        }
                                        return '转移';
                                    })
                                    .set('prompt', `将${get.translation(trigger.card)}转移给你,或令其失效`);
                                ('step 1');
                                if (result.control == '转移') {
                                    player.draw();
                                    trigger.parent.targets.remove(trigger.target);
                                    trigger.parent.targets.push(player);
                                    trigger.player.line(player);
                                } else {
                                    let cards = trigger.cards.filterInD();
                                    if (cards.length) {
                                        trigger.player.addSkill('zhenwei2');
                                        trigger.player.addToExpansion(cards, 'gain2').gaintag.add('zhenwei2');
                                    }
                                    trigger.targets.length = 0;
                                }
                            },
                            ai: {
                                threaten: 1.1,
                            },
                        },
                        诓人: {
                            enable: 'phaseUse',
                            usable: 1,
                            audio: 'kuangbi',
                            filterTarget(card, player, target) {
                                return target != player && target.countCards('he') > 0;
                            },
                            content() {
                                'step 0';
                                target.chooseCard('he', target.countCards('he'), `匡弼:将牌置于${get.translation(player)}的武将牌上`, true);
                                ('step 1');
                                player.addToExpansion(result.cards, target, 'give').gaintag.add('诓人');
                                if (!player.storage.诓人_draw) {
                                    player.storage.诓人_draw = [[], []];
                                }
                                player.storage.诓人_draw[0].push(target);
                                player.storage.诓人_draw[1].push(result.cards.length);
                                player.addSkill('诓人_draw');
                            },
                            intro: {
                                content: 'expansion',
                                markcount: 'expansion',
                            },
                            onremove(player, skill) {
                                let cards = player.getExpansions(skill);
                                if (cards.length) {
                                    player.loseToDiscardpile(cards);
                                }
                                delete player.storage[skill];
                            },
                            ai: {
                                order: 15,
                                result: {
                                    target(player, target) {
                                        if (get.attitude(player, target) <= 0) {
                                            return -target.countCards('he');
                                        }
                                        return 0;
                                    },
                                    player: 1,
                                },
                            },
                            subSkill: {
                                draw: {
                                    trigger: {
                                        player: 'phaseZhunbeiBegin',
                                    },
                                    forced: true,
                                    mark: true,
                                    charlotte: true,
                                    audio: 'kuangbi',
                                    filter(event, player) {
                                        return player.getExpansions('诓人').length;
                                    },
                                    content() {
                                        player.gain(player.getExpansions('诓人'), 'gain2');
                                        const storage = player.storage.诓人_draw;
                                        if (storage.length) {
                                            for (let i = 0; i < storage[0].length; i++) {
                                                let target = storage[0][i],
                                                    num = storage[1][i];
                                                if (target && target.isIn()) {
                                                    player.line(target);
                                                    target.draw(num);
                                                }
                                            }
                                        }
                                        player.removeSkill('诓人_draw');
                                    },
                                },
                            },
                        },
                        落宠: {
                            trigger: {
                                player: ['changeHp'],
                                global: ['roundStart'],
                            },
                            forced: true,
                            filter(event, player) {
                                return !event.getParent('落宠').name;
                            },
                            async content(event, trigger, player) {
                                let count = Math.min(numberq1(trigger.num), 9);
                                while (count-- > 0) {
                                    const controllist = ['选项一', '选项二', '选项三', '选项四'];
                                    const choiceList = ['令一名角色回复1点体力', '令一名角色失去1点体力', '令一名角色弃置两张牌', '令一名角色摸两张牌'];
                                    const effects = [
                                        (target) => {
                                            if (target == player && player.hp < 2) {
                                                return 999;
                                            }
                                            if (player.hp > player.countCards('h')) {
                                                return 1;
                                            }
                                            return get.effect(target, { name: 'tao' }, player, player);
                                        },
                                        (target) => get.effect(target, { name: 'losehp' }, player, player),
                                        (target) => 1.5 * get.effect(target, { name: 'guohe_copy2' }, player, player),
                                        (target) => get.effect(target, { name: 'wuzhong' }, player, player),
                                    ];
                                    const {
                                        result: { index },
                                    } = await player
                                        .chooseControl(controllist)
                                        .set('prompt', get.prompt('落宠'))
                                        .set('choiceList', choiceList)
                                        .set('ai', function (event, player) {
                                            function calculateMaxEffect(choice) {
                                                const index = controllist.indexOf(choice);
                                                let maxEffect = -Infinity;
                                                for (const npc of game.players) {
                                                    const effectValue = effects[index](npc);
                                                    if (effectValue > maxEffect) {
                                                        maxEffect = effectValue;
                                                    }
                                                }
                                                return maxEffect;
                                            }
                                            return controllist.slice().sort((a, b) => calculateMaxEffect(b) - calculateMaxEffect(a))[0];
                                        });
                                    const {
                                        result: { targets },
                                    } = await player.chooseTarget(choiceList[index], true).set('ai', effects[index]);
                                    if (targets && targets[0]) {
                                        switch (index) {
                                            case 0:
                                                targets[0].recover();
                                                break;
                                            case 1:
                                                targets[0].loseHp();
                                                break;
                                            case 2:
                                                targets[0].chooseToDiscard(true, 'he', 2);
                                                break;
                                            case 3:
                                                targets[0].draw(2);
                                                break;
                                        }
                                    }
                                }
                            },
                            ai: {
                                maixie: true,
                            },
                        },
                        制衡: {
                            mark: true,
                            intro: {
                                content: 'mark',
                            },
                            audio: 'rezhiheng',
                            enable: 'phaseUse',
                            filter(event, player) {
                                return player.countMark('制衡');
                            },
                            group: ['制衡_add'],
                            async content(event, trigger, player) {
                                player.removeMark('制衡', 1);
                                const { result } = await player.chooseToDiscard('hes', [1, Infinity], true).set('ai', function (card) {
                                    if (get.tag(card, 'recover')) {
                                        return 0;
                                    }
                                    return 6 - get.value(card);
                                });
                                if (result.cards && result.cards[0]) {
                                    player.draw(1 + result.cards.length);
                                }
                            },
                            subSkill: {
                                add: {
                                    audio: 'rezhiheng',
                                    trigger: {
                                        player: ['changeHp'],
                                        global: ['roundStart'],
                                    },
                                    forced: true,
                                    async content(event, trigger, player) {
                                        let count = Math.min(numberq1(trigger.num), 9);
                                        while (count-- > 0) {
                                            if (player == _status.currentPhase) {
                                                player.addMark('制衡');
                                            } else {
                                                const list = ['增加次数', '发动制衡'];
                                                const { result } = await player.chooseControl(list, function (event, player) {
                                                    if (player.countCards('hes', (card) => get.value(card) < 6)) {
                                                        return '发动制衡';
                                                    }
                                                    return '增加次数';
                                                });
                                                if (result.control == '增加次数') {
                                                    player.addMark('制衡');
                                                } else {
                                                    const { result: result1 } = await player.chooseToDiscard('hes', [1, Infinity], true).set('ai', function (card) {
                                                        if (get.tag(card, 'recover')) {
                                                            return 0;
                                                        }
                                                        return 6 - get.value(card);
                                                    });
                                                    if (result1.cards && result1.cards[0]) {
                                                        player.draw(1 + result1.cards.length);
                                                    }
                                                }
                                            }
                                        }
                                    },
                                },
                            },
                            ai: {
                                maixie: true,
                                order: 1,
                                result: {
                                    player: 1,
                                },
                            },
                        },
                        国色: {
                            enable: 'phaseUse',
                            filterTarget(card, player, target) {
                                if (target.hasSkill('不动白')) {
                                    return false;
                                }
                                return player != target;
                            },
                            filterCard: {
                                suit: 'diamond',
                            },
                            position: 'h',
                            selectTarget: 1,
                            check(card) {
                                return 20 - get.value(card);
                            },
                            content() {
                                target.addTempSkill('不动白', { player: 'phaseEnd' });
                                player.draw();
                            },
                            ai: {
                                order: 15,
                                result: {
                                    target(player, target) {
                                        return -1;
                                    },
                                    player: 1,
                                },
                                tag: {
                                    skip: 'phaseUse',
                                },
                            },
                        },
                        不动白: {
                            trigger: {
                                player: 'phaseBegin',
                            },
                            forced: true,
                            charlotte: true,
                            content() {
                                player.skip('phaseUse');
                            },
                            marktext: '乐',
                            mark: true,
                            intro: {
                                content: '跳过出牌阶段',
                            },
                        },
                        流离: {
                            audioname: ['re_daqiao', 'daxiaoqiao'],
                            trigger: {
                                target: ['useCardToPlayer'],
                            },
                            forced: true,
                            filter(event, player) {
                                if (player.countCards('he') == 0) {
                                    return false;
                                }
                                if (event.player == player) {
                                    return false;
                                }
                                return get.effect(player, event.card, event.player, player) < 0;
                            },
                            async content(event, trigger, player) {
                                //QQQ
                                const { result } = await player.chooseCardTarget({
                                    forced: true,
                                    position: 'he',
                                    filterCard: true,
                                    filterTarget(card, player, target) {
                                        return player != target;
                                    },
                                    ai1(card) {
                                        return get.unuseful(card) + 9;
                                    },
                                    ai2(target) {
                                        return target.isEnemiesOf(player);
                                    },
                                    prompt: get.prompt('流离'),
                                    prompt2: `弃置一张牌,将${get.translation(trigger.card)}转移`,
                                    source: trigger.player,
                                    card: trigger.card,
                                });
                                if (result.targets && result.targets[0] && result.cards) {
                                    player.discard(result.cards);
                                    const evt = trigger.parent;
                                    evt.targets.remove(player);
                                    evt.targets.push(result.targets[0]);
                                }
                            },
                        },
                        断粮: {
                            enable: 'phaseUse',
                            filterTarget(card, player, target) {
                                if (target.hasSkill('摸牌白')) {
                                    return false;
                                }
                                return player != target;
                            },
                            filterCard: {
                                color: 'black',
                            },
                            position: 'h',
                            selectTarget: 1,
                            check(card) {
                                return 20 - get.value(card);
                            },
                            content() {
                                target.addTempSkill('摸牌白', { player: 'phaseEnd' });
                            },
                            ai: {
                                order: 15,
                                result: {
                                    target(player, target) {
                                        return -1;
                                    },
                                },
                                tag: {
                                    skip: 'phaseDraw',
                                },
                            },
                        },
                        摸牌白: {
                            trigger: {
                                player: 'phaseBegin',
                            },
                            forced: true,
                            charlotte: true,
                            content() {
                                player.skip('phaseDraw');
                            },
                            marktext: '兵',
                            mark: true,
                            intro: {
                                content: '跳过摸牌阶段',
                            },
                        },
                        截辎: {
                            trigger: {
                                global: ['phaseDrawSkipped', 'phaseDrawCancelled'],
                            },
                            forced: true,
                            content() {
                                player.draw(2);
                            },
                        },
                        琴音: {
                            trigger: {
                                player: 'phaseEnd',
                            },
                            forced: true,
                            content() {
                                game.countPlayer(function (current) {
                                    if (current.isEnemiesOf(player)) {
                                        current.loseHp();
                                    } else {
                                        current.recover();
                                    }
                                });
                            },
                        },
                        业炎: {
                            enable: 'phaseUse',
                            usable: 1,
                            async content(event, trigger, player) {
                                const list = new Map();
                                let num = 3;
                                while (num > 0) {
                                    const {
                                        result: { targets },
                                    } = await player.chooseTarget(`分配${num}点火焰伤害`, (card, player, target) => target.isEnemiesOf(player)).set('ai', (t) => -get.attitude(player, t));
                                    if (targets && targets[0]) {
                                        num--;
                                        const index = list.get(targets[0]);
                                        if (!index) {
                                            list.set(targets[0], 1);
                                        } else {
                                            list.set(targets[0], index + 1);
                                        }
                                    } else {
                                        break;
                                    }
                                }
                                if (list.size > 0) {
                                    if (Math.random() > 0.5) {
                                        game.playAudio('../extension/缺德扩展/audio/天降业火.mp3');
                                    } else {
                                        game.playAudio('../extension/缺德扩展/audio/业火燎原.mp3');
                                    }
                                    for (const [target, num] of list) {
                                        await target.damage(num, 'fire');
                                    }
                                }
                            },
                            ai: {
                                order: 1,
                                fireAttack: true,
                                result: {
                                    player: 1,
                                },
                            },
                        },
                        奇兵: {
                            trigger: {
                                global: 'phaseEnd',
                            },
                            forced: true,
                            content() {
                                player.draw();
                                player.chooseToUse((card) => player.filterCardx(card), '使用一张牌');
                            },
                        },
                        夺锐属性: {
                            audio: 'drlt_duorui',
                            trigger: {
                                player: ['useCardToPlayer'],
                            },
                            usable: 1,
                            filter(event, player) {
                                if (event.target == player) {
                                    return false;
                                }
                                return event.target.isEnemiesOf(player);
                            },
                            forced: true,
                            logTarget: 'target',
                            content() {
                                const Q = ['体力上限', '手牌上限', '攻击范围', '摸牌数', '出杀数'].randomGet();
                                if (!player.storage.夺锐属性_1) {
                                    player.storage.夺锐属性_1 = {
                                        maxHandcard: 0,
                                        attackRange: 0,
                                        drawNum: 0,
                                        shaUsable: 0,
                                    };
                                }
                                if (!trigger.target.storage.夺锐属性_2) {
                                    trigger.target.storage.夺锐属性_2 = {
                                        maxHandcard: 0,
                                        attackRange: 0,
                                        drawNum: 0,
                                        shaUsable: 0,
                                    };
                                }
                                if (Q == '体力上限') {
                                    trigger.target.loseMaxHp();
                                    player.gainMaxHp();
                                }
                                if (Q == '手牌上限') {
                                    player.storage.夺锐属性_1.maxHandcard++;
                                    trigger.target.storage.夺锐属性_2.maxHandcard++;
                                }
                                if (Q == '攻击范围') {
                                    player.storage.夺锐属性_1.attackRange++;
                                    trigger.target.storage.夺锐属性_2.attackRange++;
                                }
                                if (Q == '摸牌数') {
                                    player.storage.夺锐属性_1.drawNum++;
                                    trigger.target.storage.夺锐属性_2.drawNum++;
                                }
                                if (Q == '出杀数') {
                                    player.storage.夺锐属性_1.shaUsable++;
                                    trigger.target.storage.夺锐属性_2.shaUsable++;
                                }
                                trigger.target.addSkill('夺锐属性_2');
                                game.log(player, '获得了', trigger.target, `的一点#g基础属性(${get.translation(Q)})`);
                            },
                            group: '夺锐属性_1',
                            subSkill: {
                                1: {
                                    trigger: {
                                        player: 'phaseDrawBegin2',
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        if (!player.storage.夺锐属性_1) {
                                            return false;
                                        }
                                        const info = player.storage.夺锐属性_1;
                                        return info.drawNum > 0 && !event.numFixed;
                                    },
                                    content() {
                                        trigger.num += player.storage.夺锐属性_1.drawNum;
                                    },
                                    mod: {
                                        maxHandcard(player, num) {
                                            if (player.storage.夺锐属性_1) {
                                                return (num += player.storage.夺锐属性_1.maxHandcard);
                                            }
                                        },
                                        attackRange(player, num) {
                                            if (player.storage.夺锐属性_1) {
                                                return (num += player.storage.夺锐属性_1.attackRange);
                                            }
                                        },
                                        cardUsable(card, player, num) {
                                            if (player.storage.夺锐属性_1 && card.name == 'sha') {
                                                return (num += player.storage.夺锐属性_1.shaUsable);
                                            }
                                        },
                                    },
                                },
                                2: {
                                    mark: true,
                                    marktext: '被夺锐',
                                    intro: {
                                        name: '被夺锐',
                                        content(storage, player) {
                                            const info = player.storage.夺锐属性_2;
                                            let str = '已被夺锐的基础属性:';
                                            if (info.maxHandcard > 0) {
                                                str += '<br>手牌上限-' + get.translation(info.maxHandcard);
                                            }
                                            if (info.attackRange > 0) {
                                                str += '<br>攻击范围-' + get.translation(info.attackRange);
                                            }
                                            if (info.drawNum > 0) {
                                                str += '<br>摸牌阶段的额定摸牌数-' + get.translation(info.drawNum);
                                            }
                                            if (info.shaUsable > 0) {
                                                str += '<br>使用【杀】的次数-' + get.translation(info.shaUsable);
                                            }
                                            return str;
                                        },
                                    },
                                    trigger: {
                                        player: 'phaseDrawBegin2',
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        const info = player.storage.夺锐属性_2;
                                        return info.drawNum > 0 && !event.numFixed;
                                    },
                                    content() {
                                        trigger.num -= player.storage.夺锐属性_2.drawNum;
                                    },
                                    mod: {
                                        maxHandcard(player, num) {
                                            return (num -= player.storage.夺锐属性_2.maxHandcard);
                                        },
                                        attackRange(player, num) {
                                            return (num -= player.storage.夺锐属性_2.attackRange);
                                        },
                                        cardUsable(card, player, num) {
                                            if (card.name == 'sha') {
                                                return (num -= player.storage.夺锐属性_2.shaUsable);
                                            }
                                        },
                                    },
                                },
                            },
                            mark: true,
                            marktext: '夺锐',
                            intro: {
                                name: '夺锐',
                                content(storage, player) {
                                    let str;
                                    if (player.storage.夺锐属性_1) {
                                        const storage = player.storage.夺锐属性_1;
                                        str = '已夺锐基础属性:';
                                        if (storage.maxHandcard > 0) {
                                            str += '<br>手牌上限+' + get.translation(storage.maxHandcard);
                                        }
                                        if (storage.attackRange > 0) {
                                            str += '<br>攻击范围+' + get.translation(storage.attackRange);
                                        }
                                        if (storage.drawNum > 0) {
                                            str += '<br>摸牌阶段的额定摸牌数+' + get.translation(storage.drawNum);
                                        }
                                        if (storage.shaUsable > 0) {
                                            str += '<br>使用【杀】的次数+' + get.translation(storage.shaUsable);
                                        }
                                    } else {
                                        str = '暂未夺锐基础属性';
                                    }
                                    return str;
                                },
                            },
                        },
                        缓图: {
                            trigger: {
                                global: 'phaseDrawBegin2',
                            },
                            check(event, player) {
                                return (event.player.isEnemiesOf(player) && event.num > 2) || (event.player.isFriendsOf(player) && event.num < 2);
                            },
                            content() {
                                game.log(trigger.player, '跳过摸牌');
                                trigger.player.draw(2);
                                trigger.cancel();
                            },
                            group: ['缓图_1', '缓图_2'],
                        },
                        缓图_1: {
                            mod: {
                                aiEV(card) {
                                    //QQQ
                                    if (card.name == 'zhuge') {
                                        return 1;
                                    }
                                    if (card.name == 'bagua') {
                                        return 96;
                                    }
                                    if (card.name == 'tengjia') {
                                        return 97;
                                    }
                                    if (card.name == 'qimenbagua') {
                                        return 98;
                                    }
                                },
                            },
                            trigger: {
                                global: 'phaseUseBefore',
                            },
                            check(event, player) {
                                return get.attitude(player, event.player) < 0;
                            },
                            content() {
                                'step 0';
                                game.log(trigger.player, '#g【跳过出牌】');
                                trigger.cancel();
                                ('step 1');
                                trigger.player.chooseUseTarget({ name: 'sha' }, '是否视为使用一张【杀】？', true, false, 'nodistance');
                            },
                        },
                        缓图_2: {
                            trigger: {
                                global: 'phaseDiscardBegin',
                            },
                            check(event, player) {
                                game.log(event.player.needsToDiscard());
                                return (event.player.isEnemiesOf(player) && event.player.needsToDiscard() < 2) || (event.player.isFriendsOf(player) && event.player.needsToDiscard() > 2);
                            },
                            content() {
                                game.log(trigger.player, '跳过弃牌');
                                trigger.player.chooseToDiscard('he', true, 2);
                                trigger.cancel();
                            },
                        },
                        //①游戏开始时,你随机获得两张未加入游戏的武将牌(称为<幻身>),第一个<幻身>固定为孙策.回合开始与结束时,你弃置任意张<幻身>并获得双倍<幻身>,每弃置一张<幻身>,增加一点体力上限和3点护甲,并获得一张<幻身>上的所有技能.你每次受到和造成伤害时,获得伤害值2倍的<幻身>
                        QD_huanshen: {
                            //①游戏开始时,你随机获得十张未加入游戏的武将牌(均称为<幻身>),第一个<幻身>固定为孙策
                            init(player, skill) {
                                _status.characterlist = Object.keys(lib.character);
                                player.storage.QD_huanshen = _status.characterlist.randomGets(2);
                                if (lib.character.sunce) {
                                    player.storage.QD_huanshen[0] = 'sunce';
                                }
                                player.addAdditionalSkill('QD_huanshen', lib.character[player.storage.QD_huanshen[0]].skills);
                            },
                            intro: {
                                mark(dialog, storage, player) {
                                    if (storage.length) {
                                        dialog.addSmall([storage, 'character']);
                                    } else {
                                        return '没有<幻身>';
                                    }
                                },
                                content(storage, _player) {
                                    return '共有' + storage.length + '张<幻身>';
                                },
                                markcount(storage, _player) {
                                    return storage.length;
                                },
                            },
                            mark: true,
                            superCharlotte: true,
                            charlotte: true,
                            fixed: true,
                            forced: true,
                            _priority: Infinity,
                            trigger: {
                                player: ['phaseBefore', 'phaseAfter'],
                            },
                            filter(_event, player, name) {
                                return player.storage.QD_huanshen?.length;
                            },
                            async content(event, trigger, player) {
                                const {
                                    result: { links },
                                } = await player.chooseButton(['弃置任意张<幻身>', [player.storage.QD_huanshen, 'character']], true, [1, player.storage.QD_huanshen.length]).set('ai', (button) => Math.random() - 0.5);
                                if (links && links[0]) {
                                    let num = links.length;
                                    game.log(`<span class="greentext">${get.translation(player)}弃置了<幻身>${get.translation(links)}</span>`);
                                    player.storage.QD_huanshen.removeArray(links);
                                    player.storage.QD_huanshen.addArray(_status.characterlist.randomGets(num * 2));
                                    while (num-- > 0) {
                                        player.gainMaxHp();
                                        player.changeHujia(3);
                                        const {
                                            result: { links: links1 },
                                        } = await player
                                            .chooseButton(['获得一张<幻身>上的所有技能', [player.storage.QD_huanshen, 'character']], true)
                                            .set('filterButton', (button) => lib.character[button.link].skills.some((q) => !player.hasSkill(q)))
                                            .set('ai', (button) => Math.random());
                                        if (links1 && links1[0]) {
                                            player.addAdditionalSkill('QD_huanshen', lib.character[links1[0]].skills, true);
                                        }
                                    }
                                }
                            },
                            group: ['QD_huanshen_1'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        player: ['damageBefore'],
                                        source: ['damageBefore'],
                                    },
                                    superCharlotte: true,
                                    charlotte: true,
                                    fixed: true,
                                    forced: true,
                                    _priority: Infinity,
                                    async content(event, trigger, player) {
                                        player.storage.QD_huanshen.addArray(_status.characterlist.randomGets(trigger.num * 2));
                                    },
                                },
                            },
                        },
                        QD_xianshu: {
                            trigger: {
                                player: ['dying'],
                            },
                            forced: true,
                            content() {
                                'step 0';
                                const T = [];
                                const E = Array.from(ui.cardPile.childNodes);
                                game.countPlayer(function (current) {
                                    E.addArray(current.getCards('hej'));
                                });
                                for (const i of E) {
                                    if (i.name == 'tao' || i.name == 'jiu') {
                                        T.push(i);
                                    }
                                }
                                if (T.length) {
                                    const A = T.randomGet();
                                    player.gain(A, true);
                                    player.useCard(A, player, false);
                                } else {
                                    event.finish();
                                }
                                ('step 1');
                                if (player.hp < 1) {
                                    event.goto(0);
                                }
                            },
                        },
                        诱言: {
                            forced: true,
                            trigger: {
                                player: ['loseEnd'],
                            },
                            filter(event, player) {
                                return event.cards?.length && !player.hasSkill('诱言_1', null, null, false);
                            },
                            content() {
                                player.addTempSkill('诱言_1', ['phaseZhunbeiAfter', 'phaseJudgeAfter', 'phaseDrawAfter', 'phaseUseAfter', 'phaseDiscardAfter', 'phaseJieshuAfter']);
                                const Q = [];
                                const list = [];
                                for (const i of trigger.cards) {
                                    list.add(i.suit);
                                }
                                for (const i of lib.suits) {
                                    if (list.includes(i)) {
                                        continue;
                                    }
                                    let card = get.cardPile2(function (card) {
                                        return card.suit == i;
                                    });
                                    if (card) {
                                        Q.push(card);
                                    }
                                }
                                if (Q.length) {
                                    player.gain(Q, 'gain2');
                                }
                            },
                            ai: {
                                effect: {
                                    player_use(card, player, target) {
                                        if (typeof card == 'object' && player.needsToDiscard() == 1 && card.cards && card.cards.filter((i) => get.position(i) == 'h').length) {
                                            return 'zeroplayertarget';
                                        }
                                    },
                                },
                            },
                            subSkill: {
                                1: {
                                    charlotte: true,
                                },
                            },
                        },
                        //①当你使用牌指定目标后,你可将目标的一张牌置于你的武将牌上作为<嫕>.②与<嫕>花色相同的牌不占用你手牌上限且无距离次数限制.③每回合结束后或当你体力变化后,你获得一张<嫕>
                        QD_wanyi: {
                            audio: 'wanyi',
                            trigger: {
                                player: ['useCardToBefore'],
                            },
                            filter(event, player) {
                                return event.target && event.target != player && event.target.countCards('he');
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                const { result } = await player.choosePlayerCard(trigger.target, true, 'he');
                                if (result?.links?.length) {
                                    player.addToExpansion(result.links, trigger.target, 'give').gaintag.add('QD_wanyi');
                                }
                            },
                            mod: {
                                cardUsable(card, player, num) {
                                    if (player.getExpansions('QD_wanyi').some((q) => q.suit == card.suit)) {
                                        return Infinity;
                                    }
                                },
                                targetInRange(card, player) {
                                    if (player.getExpansions('QD_wanyi').some((q) => q.suit == card.suit)) {
                                        return true;
                                    }
                                },
                                ignoredHandcard(card, player) {
                                    if (player.getExpansions('QD_wanyi').some((q) => q.suit == card.suit)) {
                                        return true;
                                    }
                                },
                            },
                            marktext: '嫕',
                            intro: {
                                markcount: 'expansion',
                                content: 'expansion',
                            },
                            group: ['QD_wanyi_1'],
                            subSkill: {
                                1: {
                                    audio: 'wanyi',
                                    trigger: {
                                        global: ['phaseAfter'],
                                        player: ['changeHp'],
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return player.getExpansions('QD_wanyi').length > 0;
                                    },
                                    async content(event, trigger, player) {
                                        const {
                                            result: { links },
                                        } = await player.chooseButton(['获得一张<嫕>', player.getExpansions('QD_wanyi')], true);
                                        if (links && links[0]) {
                                            player.gain(links, player, 'give');
                                        }
                                    },
                                },
                            },
                        },
                        埋祸: {
                            trigger: {
                                target: ['useCardToPlayer'],
                            },
                            logTarget: 'player',
                            filter(event, player) {
                                return event.getParent(2).name != '埋祸_1' && event.cards.filterInD().length && event.player.isIn() && event.player != player;
                            },
                            prompt2(event) {
                                return `令${get.translation(event.card)}暂时对你无效`;
                            },
                            check(event, player) {
                                return get.effect(player, event.card, event.player, player) < 0;
                            },
                            content() {
                                trigger.excluded.add(player);
                                let target = trigger.player,
                                    cards = trigger.cards.filterInD();
                                target.addToExpansion('gain2', cards).gaintag.add('埋祸_1');
                                target.storage.埋祸_target = player;
                                target.addSkill('埋祸_1');
                            },
                            group: '埋祸_2',
                            subSkill: {
                                1: {
                                    trigger: {
                                        player: 'phaseUseBegin',
                                    },
                                    forced: true,
                                    charlotte: true,
                                    filter(event, player) {
                                        return player.getExpansions('埋祸_1').length;
                                    },
                                    content() {
                                        'step 0';
                                        const Q = Math.ceil(player.getExpansions('埋祸_1').length / 2);
                                        const E = Array.from(player.getExpansions('埋祸_1')).slice(0, Q);
                                        player.loseToDiscardpile(E);
                                        ('step 1');
                                        const target = player.storage.埋祸_target;
                                        for (const i of player.getExpansions('埋祸_1')) {
                                            if (target.isIn() && player.canUse(i, target, null, true)) {
                                                player.useCard(i, target);
                                            }
                                        }
                                        ('step 2');
                                        player.removeSkill('埋祸_1');
                                    },
                                    marktext: '祸',
                                    intro: {
                                        content: 'expansion',
                                        markcount: 'expansion',
                                    },
                                    onremove(player, skill) {
                                        let cards = player.getExpansions(skill);
                                        if (cards.length) {
                                            player.loseToDiscardpile(cards);
                                        }
                                    },
                                },
                                2: {
                                    trigger: {
                                        player: ['useCardToPlayer'],
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return event.target.hasSkill('埋祸_1') && event.target.getExpansions('埋祸_1').length;
                                    },
                                    content() {
                                        trigger.target.loseToDiscardpile(trigger.target.getExpansions('埋祸_1')[0]);
                                    },
                                },
                            },
                        },
                        比翼: {
                            trigger: {
                                global: ['gameStart'],
                            },
                            forced: true,
                            audio: 'ext:缺德扩展/audio:1',
                            async content(event, trigger, player) {
                                for (const npc of player.getFriends()) {
                                    player.line(npc, 'purple');
                                    npc.addSkill('比翼_1');
                                    npc.addSkill('比翼_2');
                                }
                            },
                            group: ['比翼_1', '比翼_2'],
                            subSkill: {
                                1: {
                                    charlotte: true,
                                    trigger: {
                                        global: ['changeHp'],
                                    },
                                    forced: true,
                                    audio: 'ext:缺德扩展/audio:3',
                                    filter(event, player) {
                                        return event.player.hasSkill('比翼_1');
                                    },
                                    async content(event, trigger, player) {
                                        const players = game.players.filter((q) => q.hasSkill('比翼_1'));
                                        let num = 0;
                                        for (const i of players) {
                                            num += i.hp;
                                        }
                                        for (const i of players) {
                                            i.hp = num / players.length;
                                        }
                                        player.line(trigger.player, 'purple');
                                        player.draw(Math.ceil(numberq1(trigger.num)));
                                    },
                                },
                                2: {
                                    charlotte: true,
                                    trigger: {
                                        global: ['useCard'],
                                    },
                                    forced: true,
                                    audio: 'ext:缺德扩展/audio:3',
                                    filter(event, player) {
                                        return event.player != player && event.player.hasSkill('比翼_2') && event.targets?.length && !['equip', 'delay'].includes(get.type(event.card)) && player.countCards('he');
                                    },
                                    async content(event, trigger, player) {
                                        const {
                                            result: { cards },
                                        } = await player.chooseToDiscard('he', `弃置一张牌,令${get.translation(trigger.card)}结算两次`).set('ai', function (card) {
                                            if (trigger.card.name == 'tiesuo') {
                                                return 0;
                                            }
                                            let num = 0;
                                            for (const i of trigger.targets) {
                                                num += get.effect(i, trigger.card, trigger.player, player);
                                            }
                                            return num - get.value(card, player);
                                        });
                                        if (cards && cards[0]) {
                                            player.line(trigger.player, 'purple');
                                            trigger.effectCount++;
                                        }
                                    },
                                },
                            },
                        },
                        QD_dongfeng: {
                            trigger: {
                                global: ['gameStart'],
                            },
                            silent: true,
                            mark: true,
                            intro: {
                                content: 'expansion',
                                markcount: 'expansion',
                            },
                            async content(event, trigger, player) {
                                let cards = Array.from(ui.cardPile.childNodes).filter((q) => q.number == 7);
                                player.addToExpansion(cards, 'draw').gaintag = ['QD_dongfeng'];
                            },
                            group: ['QD_dongfeng_1'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        global: ['roundStart'],
                                    },
                                    silent: true,
                                    async content(event, trigger, player) {
                                        for (const i of game.players) {
                                            if (i.hasSkill('QD_dawu')) {
                                                i.removeSkill('QD_dawu');
                                            }
                                        }
                                        player.addToExpansion(get.cards(), 'draw').gaintag = ['QD_dongfeng'];
                                        const card1 = player.getCards('hej');
                                        const card2 = player.getExpansions('QD_dongfeng');
                                        const { result: result2 } = await player
                                            .chooseToMove('将你的牌与东风交换')
                                            .set('list', [
                                                ['东风', card2],
                                                ['你的牌', card1],
                                            ])
                                            .set('filterMove', (from, to) => typeof to != 'number')
                                            .set('processAI', function (list) {
                                                let card = list[0][1].concat(list[1][1]);
                                                card.sort((a, b) => get.value(b) - get.value(a));
                                                let cardQ = [],
                                                    num = list[1][1].length;
                                                while (num-- > 0) {
                                                    cardQ.unshift(card.shift());
                                                }
                                                return [card, cardQ];
                                            });
                                        if (result2.moved && result2.moved[0]) {
                                            player.addToExpansion(
                                                result2.moved[0].filter((q) => !card2.includes(q)),
                                                'draw'
                                            ).gaintag = ['QD_dongfeng'];
                                            player.gain(
                                                result2.moved[1].filter((q) => !card1.includes(q)),
                                                'gain2'
                                            );
                                        }
                                        const { result } = await player.chooseTarget('大雾', (c, p, t) => !t.hasSkill('QD_dawu'), [1, game.players.length]).set('ai', (t) => t.isFriendsOf(player));
                                        if (result.targets && result.targets[0]) {
                                            for (const i of result.targets) {
                                                i.addSkill('QD_dawu');
                                                player.loseToDiscardpile(player.getExpansions('QD_dongfeng').randomGet());
                                            }
                                        }
                                        const { result: result1 } = await player.chooseTarget('狂风', (c, p, t) => !t.hasSkill('QD_kuangfeng'), [1, game.players.length]).set('ai', (t) => t.isEnemiesOf(player));
                                        if (result1.targets && result1.targets[0]) {
                                            for (const i of result1.targets) {
                                                i.addTempSkill('QD_kuangfeng', { global: 'roundStart' });
                                                i.damage(Array.from(lib.nature.keys()).randomGet());
                                                player.loseToDiscardpile(player.getExpansions('QD_dongfeng').randomGet());
                                            }
                                        }
                                    },
                                },
                            },
                        },
                        QD_dawu: {
                            _priority: 7,
                            trigger: {
                                player: ['damageBegin4'],
                            },
                            forced: true,
                            mark: true,
                            intro: {
                                name: '雾',
                            },
                            filter(event, player) {
                                return Array.from(lib.nature.keys()).concat(undefined).randomGet() != event.nature;
                            },
                            async content(event, trigger, player) {
                                trigger.finished = true;
                            },
                        },
                        QD_kuangfeng: {
                            trigger: {
                                player: ['damageBefore'],
                            },
                            forced: true,
                            mark: true,
                            intro: {
                                name: '风',
                            },
                            filter: (event, player) => event.nature,
                            async content(event, trigger, player) {
                                trigger.num = trigger.num * 2 || 2;
                            },
                        },
                        //转换技,你可以终止其他角色一个<触发技/主动技>的发动
                        QD_jinfa: {
                            init(player) {
                                player.storage.QD_jinfa = true;
                            },
                            zhuanhuanji: true,
                            mark: true,
                            intro: {
                                content(storage) {
                                    if (storage) {
                                        return '当前可以终止触发技';
                                    }
                                    return '当前可以终止主动技';
                                },
                            },
                            trigger: {
                                global: ['logSkillBegin', 'useSkillBegin'],
                            },
                            popup: false,
                            filter(event, player, name) {
                                return event.player != player && (name == 'logSkillBegin') == player.storage.QD_jinfa;
                            },
                            check(event, player) {
                                return event.player.isEnemiesOf(player) && event.skill != 'QD_kuangfeng' && !lib.skill.global.includes(event.skill);
                            },
                            prompt(event) {
                                return `终止${get.translation(event.skill)}的发动`;
                            },
                            async content(event, trigger, player) {
                                player.storage.QD_jinfa = !player.storage.QD_jinfa;
                                const name = trigger.skill;
                                const info = lib.skill[name];
                                if (trigger.name == 'logSkillBegin') {
                                    const arr = trigger.parent.next;
                                    for (let i = arr.length - 1; i >= 0; i--) {
                                        if (arr[i].name === name) {
                                            arr.splice(i, 1);
                                        }
                                    }
                                } //被终止的触发技也会计入次数
                                else {
                                    const stat = trigger.player.stat;
                                    const statskill = stat[stat.length - 1].skill;
                                    statskill[name] = numberq0(statskill[name]) + 1;
                                    if (info.sourceSkill) {
                                        statskill[info.sourceSkill] = numberq0(statskill[info.sourceSkill]) + 1;
                                    }
                                    trigger.cancel();
                                } //被终止的主动技不会计入次数,要手动加一下
                                game.log(player, `终止${get.translation(name)}的发动`);
                                if (info.limited || info.juexingji) {
                                    trigger.player.awakenSkill(name);
                                }
                            },
                        },
                        QD_junlve: {
                            audio: 'nzry_junlve',
                            intro: {
                                content: '当前有#个标记',
                            },
                            trigger: {
                                player: 'damageAfter',
                                source: 'damageSource',
                            },
                            forced: true,
                            content() {
                                player.addMark('QD_junlve', trigger.num);
                            },
                        },
                        QD_cuike: {
                            audio: 'nzry_cuike',
                            trigger: {
                                player: 'phaseUseBegin',
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                //QQQ
                                const num = player.countMark('QD_junlve');
                                if (num % 2 == 1) {
                                    const { result } = await player.chooseTarget(`是否发动【摧克】,对一名其他角色造成${num}点伤害`, (c, p, t) => t != p).set('ai', (target) => -get.attitude(player, target));
                                    if (result.bool) {
                                        result.targets[0].damage(num);
                                    }
                                } else {
                                    const { result } = await player.chooseTarget(`是否发动【摧克】,横置一名其他角色并弃置其区域内的${num || 1}张牌`, (c, p, t) => t != p).set('ai', (target) => -get.attitude(player, target));
                                    if (result.bool) {
                                        result.targets[0].link(true);
                                        player.discardPlayerCard(result.targets[0], num || 1, 'hej', true);
                                    }
                                }
                                if (num > 7) {
                                    const { result } = await player
                                        .chooseBool()
                                        .set('ai', function () {
                                            return true;
                                        })
                                        .set('prompt', `是否弃置所有<军略>标记并对所有其他角色造成${num}点伤害`);
                                    if (result.bool) {
                                        for (const i of game.players) {
                                            if (i != player) {
                                                player.line(i);
                                                i.damage(num);
                                            }
                                        }
                                        player.removeMark('QD_junlve', num);
                                    }
                                }
                            },
                        },
                        // 出牌阶段限一次,你可以令至多军略数的已横置角色弃置所有装备区内的牌.你对其中一名其他角色造成军略数点火焰伤害
                        QD_dinghuo: {
                            audio: 'nzry_dinghuo',
                            intro: {
                                content: 'limited',
                            },
                            mark: true,
                            enable: 'phaseUse',
                            usable: 1,
                            filter(event, player) {
                                return player.countMark('QD_junlve') > 0;
                            },
                            check(event, player) {
                                return game.players.some((q) => q.isEnemiesOf(player) && q.isLinked() && q.countCards('e') > 1);
                            },
                            filterTarget(card, player, target) {
                                return target.isLinked() && target != player;
                            },
                            selectTarget() {
                                return [1, _status.event.player.countMark('QD_junlve')];
                            },
                            multiline: true,
                            multitarget: true,
                            async content(event, trigger, player) {
                                const num = player.countMark('QD_junlve');
                                for (const i of event.targets) {
                                    i.discard(i.getCards('e'));
                                }
                                const { result } = await player.chooseTarget(true, `对一名目标角色造成${num}点火焰伤害`, function (card, player, target) {
                                    return event.targets.includes(target);
                                });
                                if (result.bool) {
                                    result.targets[0].damage(num, 'fire', 'nocard');
                                }
                            },
                            ai: {
                                order: 1,
                                fireAttack: true,
                                result: {
                                    target(player, target) {
                                        if (target.hasSkillTag('nofire')) {
                                            return 0;
                                        }
                                        return -2 * player.countMark('QD_junlve') - target.countCards('e');
                                    },
                                },
                            },
                        },
                        //绝情
                        // 当你<造成/受到>伤害时,你可以弃置任意张牌,此伤害改为体力流失.若弃置牌数大于对方体力值,此伤害<+1/-1>
                        // 当一名角色进入濒死状态时,若无伤害来源,你增加一点体力上限
                        QD_jueqing: {
                            trigger: {
                                player: ['damageBefore'],
                                source: ['damageBefore'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                const {
                                    result: { cards },
                                } = await player.chooseToDiscard('弃置任意张牌,此伤害改为体力流失', 'he', [1, player.countCards('he')]).set('ai', (card) => {
                                    if (trigger.player == player) {
                                        if (get.tag(card, 'recover')) {
                                            return -1;
                                        }
                                        if (player.isPhaseUsing() && player.hasValueTarget(card, null, true)) {
                                            return -1;
                                        }
                                        return 10;
                                    } else {
                                        if (player.isPhaseUsing() && player.hasValueTarget(card, null, true)) {
                                            return -1;
                                        }
                                        const maixie = ['maihp', 'maixie_defend', 'maixie'].some((q) => trigger.player.hasSkillTag(q));
                                        if (trigger.player.isFriendsOf(player) && maixie) {
                                            return -1;
                                        }
                                        return 10;
                                    }
                                });
                                if (cards?.length) {
                                    if (trigger.player == player && (!trigger.source || cards.length > trigger.source.hp)) {
                                        trigger.num--;
                                    } else if (trigger.source == player && cards.length > trigger.player.hp) {
                                        trigger.num++;
                                    }
                                    trigger.cancel();
                                    trigger.player.loseHp(trigger.num);
                                }
                            },
                            group: ['QD_jueqing_1'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        global: ['dying'],
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        if (event.parent.name == 'damage' && event.parent.source) {
                                            return false;
                                        }
                                        return true;
                                    },
                                    async content(event, trigger, player) {
                                        //QQQ
                                        player.gainMaxHp();
                                    },
                                },
                            },
                        },
                        //伤逝
                        // 你手牌数始终不小于已损体力值(至少为1),你以此法获得的牌不可被响应且无次数距离限制
                        QD_shangshi: {
                            mod: {
                                cardUsable(card, player, num) {
                                    if (card.cards?.some((q) => q.gaintag?.includes('eternal_QD_shangshi'))) {
                                        return Infinity;
                                    }
                                }, //这里是vcard
                                targetInRange(card, player) {
                                    if (card.cards?.some((q) => q.gaintag?.includes('eternal_QD_shangshi'))) {
                                        return true;
                                    }
                                },
                            }, //这里是vcard
                            trigger: {
                                player: ['loseEnd', 'changeHp'],
                            },
                            forced: true,
                            filter: (event, player) => player.countCards('h') < numberq1(player.maxHp - player.hp),
                            async content(event, trigger, player) {
                                const { result } = await player.drawTo(numberq1(player.maxHp - player.hp));
                                for (const card of result) {
                                    card.addGaintag('eternal_QD_shangshi');
                                }
                            },
                            ai: {
                                effect: {
                                    player(card, player, target) {
                                        if (lib.card[card.name]) {
                                            if (player.getEquips('zhuge') && get.subtype(card) == 'equip1' && card.name != 'zhuge') {
                                                return -1;
                                            }
                                            return [1, 20]; //无脑用牌
                                        }
                                    },
                                },
                            },
                            group: ['QD_shangshi_1'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        player: ['useCardToBefore'],
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return event.cards?.some((card) => card.gaintag?.includes('eternal_QD_shangshi'));
                                    },
                                    async content(event, trigger, player) {
                                        trigger.directHit = true;
                                    },
                                },
                            },
                        },
                        //你的手牌上限+x,摸牌阶段你多摸x张牌,x为你的体力上限
                        QD_yingzi: {
                            mod: {
                                maxHandcard(player, num) {
                                    return (num = player.maxHp + player.hp);
                                },
                            },
                            trigger: {
                                player: 'phaseDrawBegin2',
                            },
                            forced: true,
                            content() {
                                trigger.num += player.maxHp;
                            },
                        },
                        //当你使用红色牌或成为牌的唯一目标后,你摸一张牌
                        // 当你于因此摸牌数首次达到X张牌后,将记录值清零,你增加一点体力上限,选择一项:①回满体力;②摸X张牌;③获得<英魂>;④获得<英姿>.x为你的体力上限.
                        QD_jiang: {
                            trigger: {
                                global: ['useCardBefore'],
                            },
                            forced: true,
                            init: (player) => (player.storage.QD_jiang = 0),
                            filter: (event, player) => (event.targets && event.targets.length == 1 && event.targets[0] == player) || (event.player == player && get.color(event.card) == 'red'),
                            async content(event, trigger, player) {
                                //QQQ
                                player.draw();
                                player.storage.QD_jiang++;
                                if (player.storage.QD_jiang > player.maxHp) {
                                    player.storage.QD_jiang -= player.maxHp;
                                    player.maxHp++;
                                    const control = [`摸${player.maxHp}张牌`];
                                    if (player.hp < player.maxHp) {
                                        control.push('回满体力');
                                    }
                                    if (!player.hasSkill('QD_yinghun')) {
                                        control.push('获得<英魂>');
                                    }
                                    if (!player.hasSkill('QD_yingzi')) {
                                        control.push('获得<英姿>');
                                    }
                                    const { result } = await player.chooseControl(control).set('ai', () => {
                                        if (player.hp < 3) {
                                            return '回满体力';
                                        }
                                        if (control.includes('获得<英魂>')) {
                                            return '获得<英魂>';
                                        }
                                        if (control.includes('获得<英姿>')) {
                                            return '获得<英姿>';
                                        }
                                        if (player.maxHp > 2 * player.hp) {
                                            return '回满体力';
                                        }
                                        return `摸${player.maxHp}张牌`;
                                    });
                                    if (result.control == '回满体力') {
                                        player.hp = player.maxHp;
                                        game.log(player, '回满体力');
                                    }
                                    if (result.control == `摸${player.maxHp}张牌`) {
                                        player.draw(Math.min(player.maxHp, 20));
                                    }
                                    if (result.control == '获得<英魂>') {
                                        player.addSkill('QD_yinghun');
                                    }
                                    if (result.control == '获得<英姿>') {
                                        player.addSkill('QD_yingzi');
                                    }
                                }
                            },
                        },
                        //每轮开始时,你可以弃置一名角色至多X张牌,令一名角色摸剩余数量张牌
                        QD_yinghun: {
                            trigger: {
                                global: ['roundStart'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                //QQQ
                                const { result } = await player.chooseTarget(`弃置一名角色至多${player.maxHp}张牌`, (c, p, t) => t != p && t.countCards('he')).set('ai', (target) => -get.attitude(player, target));
                                if (result.targets && result.targets[0]) {
                                    const { result: result1 } = await player.discardPlayerCard(result.targets[0], 'he', [1, Math.min(result.targets[0].countCards('he'), player.maxHp)]);
                                    if (result1?.cards?.length) {
                                        player.draw(player.maxHp - result1.cards.length);
                                    } else {
                                        player.draw(Math.min(player.maxHp, 20));
                                    }
                                } else {
                                    player.draw(Math.min(player.maxHp, 20));
                                }
                            },
                        },
                        //<出牌阶段外失去牌/出牌阶段内不因使用而失去牌>后,你可以获得其他角色的y张牌(y不大于2x),摸2x-y张牌(x为你失去牌的数量)
                        QD_tuntian: {
                            audio: 'tuntian',
                            trigger: {
                                player: ['loseEnd'],
                            },
                            forced: true,
                            filter(event, player) {
                                if (player == _status.currentPhase && event.getParent('phaseUse', true)) {
                                    return !['useCard', 'respond', 'equip'].includes(event.parent.name);
                                }
                                return true;
                            },
                            async content(event, trigger, player) {
                                const list = new Map();
                                let num = 2 * trigger.cards.length;
                                while (num > 0) {
                                    const {
                                        result: { targets },
                                    } = await player
                                        .chooseTarget(`获得任意名角色区域内的${num}张牌`, (card, player, target) => {
                                            return (
                                                target != player &&
                                                target.hasCard((c) => {
                                                    const discarded = list.get(target);
                                                    if (discarded?.includes(c)) {
                                                        return false;
                                                    }
                                                    return lib.filter.canBeGained(c, player, target, 'dcluochong');
                                                }, 'hej')
                                            );
                                        })
                                        .set('ai', (target) => {
                                            const discarded = list.get(target);
                                            if (discarded?.length >= target.countCards('he')) {
                                                return 0;
                                            }
                                            return get.effect(target, { name: 'shunshou' }, player, player);
                                        });
                                    if (targets?.length) {
                                        const {
                                            result: { cards },
                                        } = await player
                                            .choosePlayerCard(targets[0], true, 'hej', [1, num], `选择获得${get.translation(targets[0])}区域内的牌`)
                                            .set('filterButton', (button) => {
                                                const discarded = list.get(targets[0]);
                                                if (discarded?.includes(button.link)) {
                                                    return false;
                                                }
                                                return lib.filter.canBeGained(button.link, player, targets[0], 'dcluochong');
                                            })
                                            .set('ai', (button) => {
                                                if (ui.selected.buttons.length > 0) {
                                                    return false;
                                                } //一次进行一张牌的ai计算
                                                return get.value(button.link, targets[0]) * -get.attitude(player, targets[0]);
                                            });
                                        if (cards?.length) {
                                            num -= cards.length;
                                            const discarded = list.get(targets[0]);
                                            if (!discarded) {
                                                list.set(targets[0], cards);
                                            } else {
                                                discarded.addArray(cards);
                                            }
                                        }
                                    } else {
                                        break;
                                    }
                                }
                                if (num > 0) {
                                    await player.draw(num);
                                }
                                if (list.size) {
                                    for (const [target, cards] of list) {
                                        await target.give(cards, player);
                                    }
                                }
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————貂蝉
                        //离间
                        // 回合每名角色限一次,你可以弃置其一张牌,选择一名其他角色,令后者视为对前者使用一张【决斗】
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
                                    document.body.QD_BG('QD_diaochan1');
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
                        //闭月
                        // 一名角色结束阶段,你摸两张牌
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
                        //結姻
                        // 回合每名角色限一次,你可以选择一名角色,你弃置其一张手牌或将其一张装备牌置入你的装备区.若如此做,你摸一张牌并回复1点体力
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
                        //枭姬
                        // 全场角色失去装备牌后,你摸两张牌
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
                        //國色
                        // 回合每名角色限一次,你可以观看并弃置其区域内的一张◆牌,你选择一项:1.视为对一名角色使用一张【乐不思蜀】;2.移动或弃置场上一张【乐不思蜀】.若如此做,你摸一张牌
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
                                        } = await player
                                            .chooseTarget('选择乐不思蜀的目标', (c, p, t) => t != p)
                                            .set('ai', (t) => {
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
                        //流離
                        // 当你成为其他角色使用伤害牌的目标时,你可以弃置其一张牌,将此牌转移给一名其他角色
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
                        //——————————————————————————————————————————————————————————————————————————————————————————————————甄姬
                        //洛神
                        // 一名角色准备阶段,你进行一次判定并获得此牌,若结果不为红色,你重复此流程.你的黑色牌不计入手牌上限和使用次数
                        QD_luoshen: {
                            mod: {
                                cardUsable(card, player, num) {
                                    if (get.color(card) == 'black') {
                                        return Infinity;
                                    }
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
                        //傾國
                        // 你可以将一张黑色牌当做【闪】使用或打出.当你需要使用或打出闪时,其他所有角色选择是否交给你一张黑色牌,你可以令没交给你牌的角色受到一点冰冻伤害或翻面
                        QD_qingguo: {
                            enable: ['chooseToRespond', 'chooseToUse'],
                            filterCard(card) {
                                return get.color(card) == 'black';
                            },
                            position: 'hes',
                            viewAs: { name: 'shan' },
                            viewAsFilter(player) {
                                if (!player.countCards('hes', { color: 'black' })) {
                                    return false;
                                }
                            },
                            prompt: '将一张黑色牌当闪打出',
                            check() {
                                return 1;
                            },
                            ai: {
                                order: 2,
                                respondShan: true,
                                skillTagFilter(player, tag) {
                                    return Boolean(player.countCards('hes', { color: 'black' }));
                                },
                                effect: {
                                    target(card, player, target, current) {
                                        if (get.tag(card, 'respondShan') && current < 0) {
                                            return 0.6;
                                        }
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
                                        return player.filterCard('shan');
                                    },
                                    async content(event, trigger, player) {
                                        for (const npc of game.players) {
                                            if (npc == player) {
                                                continue;
                                            }
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
                                                        if (npc.isTurnedOver() && button.link == '翻面') {
                                                            return 9;
                                                        }
                                                        return -1;
                                                    } else {
                                                        if (button.link == '翻面') {
                                                            if (npc.isTurnedOver()) {
                                                                return -1;
                                                            }
                                                            return 9;
                                                        }
                                                        return 3;
                                                    }
                                                });
                                                if (links && links[0]) {
                                                    if (links[0] == '翻面') {
                                                        npc.turnOver();
                                                    } else if (links[0] == '受到一点无来源火焰伤害') {
                                                        npc.damage('ice');
                                                    }
                                                }
                                            }
                                        }
                                    },
                                },
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————黄月英
                        //集智
                        // 每种牌名每阶段限一次,你可以将两张花色相同的非锦囊牌当任意普通锦囊牌使用;任意角色使用锦囊牌时,你摸一张牌,手牌上限+1
                        QD_jizhi: {
                            init(player) {
                                player.storage.QD_jizhi = [];
                            },
                            hiddenCard(player, name) {
                                if (lib.card[name]?.type == 'trick' && !player.storage.QD_jizhi.includes(name)) {
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
                                }
                            },
                            enable: ['chooseToUse'],
                            filter(event, player) {
                                if (!player.qcard('trick').filter((q) => !player.storage.QD_jizhi.includes(q[2])).length) {
                                    return false;
                                }
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
                                    const list = player.qcard('trick').filter((q) => !player.storage.QD_jizhi.includes(q[2]));
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
                                    if (button.link[2] == 'wuzhong') {
                                        return 9999;
                                    }
                                    return number0(num) + 10;
                                },
                                backup(links, player) {
                                    return {
                                        check(card) {
                                            return 12 - get.value(card);
                                        },
                                        filterCard(card) {
                                            if (get.type(card) == 'trick') {
                                                return false;
                                            }
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
                                        global: ['phaseEnd', 'phaseZhunbeiEnd', 'phaseJudgeEnd', 'phaseDrawEnd', 'phaseUseEnd', 'phaseDiscardEnd', 'phaseJieshuEnd'],
                                    },
                                    forced: true,
                                    popup: false,
                                    async content(event, trigger, player) {
                                        player.storage.QD_jizhi = [];
                                    },
                                },
                            },
                        },
                        //奇才
                        // 你使用锦囊牌无距离限制,你装备区内的牌不能因替换装备外失去
                        QD_qicai: {
                            mod: {
                                targetInRange(card, player, target, now) {
                                    if (['trick', 'delay'].includes(get.type(card))) {
                                        return true;
                                    }
                                },
                            },
                            trigger: {
                                player: ['loseBefore'],
                            },
                            forced: true,
                            filter(event, player) {
                                if (event.getParent(2).name == 'moveCard') {
                                    return true;
                                }
                                if (event.parent.name == 'equip') {
                                    return false;
                                }
                                return event.cards.some((card) => player.getCards('e').includes(card));
                            },
                            async content(event, trigger, player) {
                                trigger.cards.removeArray(player.getCards('e'));
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————华佗
                        //急救
                        // 你可以将场上或你区域内红色牌当张【桃】、黑色牌当【酒】对一名角色使用
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
                                return (player.filterCard('tao') && list.some((q) => get.color(q) == 'red')) || (player.filterCard('jiu') && list.some((q) => get.color(q) != 'red'));
                            },
                            async content(event, trigger, player) {
                                const color = ['red', 'black', 'none'];
                                const evt = event.getParent(2);
                                if (!player.filterCard('tao')) {
                                    color.remove('red');
                                }
                                if (!player.filterCard('jiu')) {
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
                                    const target = evt.parent.name == '_save' ? _status.dying : player;
                                    await player.useCard({ name: name }, links, target, false);
                                }
                            },
                            ai: {
                                save: true,
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
                        //青囊
                        // 回合每名角色限一次,你可以弃置其一张牌并令其失去或回复一点体力
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
                        //除癀
                        // 每轮开始时,你可以弃置任意名角色各一张牌.当一名角色弃置非红色牌后,你可以令其摸或弃一张牌
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
                                            if (get.color(button.link) == 'red') {
                                                return get.value(button.link) * sgn(npc.isEnemiesOf(player));
                                            }
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
                        //——————————————————————————————————————————————————————————————————————————————————————————————————周瑜
                        //英姿
                        // 你不因此技能获得牌时摸一张牌,每轮开始时,你可以令一名其他角色于本轮获得牌时随机少获得一张牌
                        QD_yingzix: {
                            trigger: {
                                player: ['gainBefore'],
                            },
                            forced: true,
                            filter(event, player) {
                                return !event.getParent('QD_yingzix').name;
                            },
                            async content(event, trigger, player) {
                                player.draw();
                            },
                            group: ['QD_yingzix_1'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        global: ['roundStart'],
                                    },
                                    forced: true,
                                    async content(event, trigger, player) {
                                        for (const i of game.players) {
                                            if (i.hasSkill('QD_yingzix_2')) {
                                                i.removeSkill('QD_yingzix_2');
                                            }
                                        }
                                        const {
                                            result: { targets },
                                        } = await player.chooseTarget('令一名其他角色于本轮获得牌时随机少获得一张牌', (c, p, t) => p != t).set('ai', (t) => -get.attitude(player, t));
                                        if (targets && targets[0]) {
                                            targets[0].addSkill('QD_yingzix_2');
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
                        //反间
                        // 回合每种花色限一次,你可以声明一个花色获得一名角色一张牌.若此牌花色与你声明的花色不同,其弃置与此牌花色相同的牌.若其因此弃置了牌,其失去1点体力
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
                                    .set('prompt', `声明一个花色获得${get.translation(event.target)}一张手牌`)
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
                        //——————————————————————————————————————————————————————————————————————————————————————————————————黄盖
                        //苦肉
                        // 回合每名角色限一次,你可以弃置其一张牌令其失去1点体力
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
                                        if (target.hp < 2) {
                                            return -4;
                                        }
                                        return -2;
                                    },
                                    player: 3,
                                },
                            },
                        },
                        //詐降
                        // 当场上一名角色失去1点体力后,你摸x张牌,增加1点护甲,使用【杀】的次数永久+1,本阶段使用【杀】无距离限制且不能被响应(X为<詐降>发动次数)
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
                        //——————————————————————————————————————————————————————————————————————————————————————————————————孙权
                        //制衡
                        // 回合限一次,你可以弃置一名角色任意张牌,摸等量的牌(若弃置了一个区域内的所有牌,则多摸一张牌)
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
                                const { result } = await player.discardPlayerCard(event.target, 'he', [1, hs.concat(es).length]).set('ai', (button) => 1);
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
                        // 救援
                        // 当其他角色使用【桃】时,你可以令此牌目标改为你,你摸一张牌.其他角色对你使用的【桃】回复的体力值+1
                        // 当你需要使用【桃】时,你可以令任意其他角色代替你使用一张【桃】,否则该角色失去一点体力
                        // 若此时为你的出牌阶段,此技能本阶段失效
                        QD_jiuyuan: {
                            trigger: {
                                global: ['taoBegin'],
                            },
                            forced: true,
                            filter(event, player) {
                                return event.player != player;
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
                                        return player.filterCard('tao');
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
                                            if (_status.currentPhase == player && event.getParent('phaseUse', true)) {
                                                player.tempBanSkill('QD_jiuyuan_1', { global: 'phaseUseEnd' });
                                            }
                                        }
                                    },
                                },
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————朱桓
                        //奋励
                        // 任意角色回合开始时,若其(手牌数/体力值/装备区里的牌数)为全场最大或最小,你可以令其跳过(摸牌阶段/出牌阶段/弃牌阶段)
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
                                if (trigger.player.isMaxHandcard() || trigger.player.isMinHandcard()) {
                                    list.add('摸牌阶段');
                                }
                                if (trigger.player.isMaxHp() || trigger.player.isMinHp()) {
                                    list.add('出牌阶段');
                                }
                                if (trigger.player.isMaxEquip() || trigger.player.isMinEquip()) {
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
                        //平寇
                        // 一名角色回合结束时,你可以分配至多X点伤害(X为其本回合跳过的阶段数)
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
                        //——————————————————————————————————————————————————————————————————————————————————————————————————陆抗
                        //谦节
                        // 你不能被横置与翻面,不能成为延时锦囊牌或其他角色拼点的目标,你可以重铸装备牌
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
                                    if (get.type(card) == 'delay') {
                                        return false;
                                    }
                                },
                            },
                            enable: 'phaseUse',
                            position: 'he',
                            filter: (event, player) => player.hasCard((card) => get.type(card) == 'equip' && player.canRecast(card), 'he'),
                            filterCard: (card, player) => get.type(card) == 'equip' && player.canRecast(card),
                            check(card) {
                                if (get.position(card) == 'e') {
                                    return 0.5 - get.value(card, get.player());
                                }
                                if (!get.player().canEquip(card)) {
                                    return 5;
                                }
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
                        //决堰
                        // 每轮开始时,你可以废除一名角色的装备区
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
                                        if (t == _status.roundStart) {
                                            return 99;
                                        }
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
                        //破势
                        // 一名角色回合开始时,若其存在废除的装备栏,你按被废除的区域执行:武器栏,你使用【杀】的次数上限永久+3;防具栏,你摸三张牌且手牌上限永久+3;坐骑栏,你使用牌无距离限制直到你的回合结束;宝物栏,你获得技能<集智>直到你的回合结束
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
                        //——————————————————————————————————————————————————————————————————————————————————————————————————周泰
                        //不屈
                        // 当你进入濒死状态时,你可以令一名角色展示牌堆顶一张牌,若此牌与其武将牌上的不屈牌点数均不同,你将此牌置于其武将牌上,将体力回复至1.否则你获得所有不屈牌,其执行一次濒死结算,若其因此死亡,则终止你的濒死结算.你的手牌上限+全场不屈牌的数量
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
                        //——————————————————————————————————————————————————————————————————————————————————————————————————陆逊
                        //謙遜
                        // 当一张锦囊牌被使用时,你可以将任意名角色至多X张牌当作<谦逊>牌置于你的武将牌上(X为你<谦逊>牌数且至少为一)
                        // 每回合结束时,你选择获得一半(向下取整)的<谦逊>牌
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
                                const numq = player.getExpansions('QD_qianxun').length;
                                let num = Math.max(numq, 1);
                                while (num > 0) {
                                    const {
                                        result: { targets },
                                    } = await player
                                        .chooseTarget(`将任意名角色至多${num}张牌当作<谦逊>牌置于你的武将牌上`, (c, p, t) => t.countCards('he'))
                                        .set('ai', (t) => {
                                            if (numq < 5) {
                                                return 20 - get.attitude(player, t);
                                            }
                                            return -get.attitude(player, t);
                                        });
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
                                        return player.getExpansions('QD_qianxun').length > 1;
                                    },
                                    async content(event, trigger, player) {
                                        const cards = player.getExpansions('QD_qianxun');
                                        const num = Math.floor(cards.length / 2);
                                        const {
                                            result: { links },
                                        } = await player.chooseButton([`选择获得一半(向下取整)的<谦逊>牌`, cards], num, true).set('ai', (button) => get.value(button.link) - 7);
                                        if (links && links[0]) {
                                            game.cardsGotoOrdering(links);
                                            player.gain(links, 'gain2');
                                        }
                                    },
                                },
                            },
                        },
                        //連營
                        // 每当一个区域内失去最后一张牌时,你摸X张牌.当你一次性获得至少两张牌时,你可以分配其中的红色牌数点火焰伤害
                        QD_lianying: {
                            trigger: {
                                global: ['loseBegin'],
                            },
                            filter(event, player) {
                                return ['h', 'e', 'j'].some((i) => event.player.getCards(i).length && event.player.getCards(i).every((q) => event.cards?.includes(q)));
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                let num = ['h', 'e', 'j'].filter((i) => {
                                    const cards = trigger.player.getCards(i);
                                    return cards.length && cards.every((q) => trigger.cards?.includes(q));
                                }).length;
                                let numx = Math.max(player.getExpansions('QD_qianxun').length, 1);
                                while (num-- > 0) {
                                    await player.draw(numx);
                                }
                            },
                            ai: {
                                effect: {
                                    player(card, player, target) {
                                        if (lib.card[card.name]) {
                                            if (player.getEquips('zhuge') && get.subtype(card) == 'equip1' && card.name != 'zhuge') {
                                                return -1;
                                            }
                                            return [1, 1.6]; //无脑用牌
                                        }
                                    },
                                },
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
                                            } = await player.chooseTarget('分配火焰伤害', (card, player, target) => target != player).set('ai', (t) => -get.attitude(player, t));
                                            if (targets && targets[0]) {
                                                await targets[0].damage('fire');
                                            } else {
                                                break;
                                            }
                                        }
                                    },
                                },
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————钟繇
                        //活墨
                        // 你可以将当前回合角色区域内一张牌置于牌堆顶,视为使用一张本回合未以此法使用过的基本牌
                        QD_huomo: {
                            enable: ['chooseToUse', 'chooseToRespond'],
                            init(player) {
                                player.storage.QD_huomo = [];
                            },
                            filter(event, player) {
                                return player.qcard('basic').filter((q) => !player.storage.QD_huomo.includes(q[2])).length && _status.currentPhase?.countCards('he');
                            },
                            hiddenCard(player, name) {
                                return lib.card[name]?.type == 'basic' && _status.currentPhase?.countCards('he') && !player.storage.QD_huomo.includes(name);
                            },
                            chooseButton: {
                                dialog(event, player) {
                                    return ui.create.dialog('活墨', [player.qcard('basic').filter((q) => !player.storage.QD_huomo.includes(q[2])), 'vcard'], 'hidden');
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
                                    return number0(num) + 10;
                                },
                                backup(links, player) {
                                    return {
                                        filterCard(card) {
                                            return false;
                                        },
                                        selectCard: -1,
                                        viewAs: {
                                            name: links[0][2],
                                            nature: links[0][3],
                                            suit: links[0][0],
                                            number: links[0][1],
                                        },
                                        async precontent(event, trigger, player) {
                                            player.storage.QD_huomo.push(event.result.card.name);
                                            const {
                                                result: { links },
                                            } = await player.choosePlayerCard(_status.currentPhase, true, 'he', 'visible').set('ai', (b) => sgn(_status.currentPhase.isEnemiesOf(player)) * get.value(b.link));
                                            if (links?.length) {
                                                _status.currentPhase.lose(links, ui.cardPile, 'insert');
                                            }
                                        },
                                    };
                                },
                                prompt(links, player) {
                                    return '将当前回合角色区域内一张牌置于牌堆顶,视为使用一张本回合未以此法使用过的基本牌';
                                },
                            },
                            ai: {
                                order: 99,
                                respondShan: true,
                                respondSha: true,
                                save: true,
                                skillTagFilter(player, tag, arg) {
                                    if (_status.currentPhase?.countCards('he')) {
                                        if (tag == 'respondShan') {
                                            return !player.storage.QD_huomo.includes('shan');
                                        }
                                        if (tag == 'respondSha') {
                                            return !player.storage.QD_huomo.includes('sha');
                                        }
                                    }
                                    return false;
                                },
                                result: {
                                    player(player) {
                                        if (_status.event.dying) {
                                            return get.attitude(player, _status.event.dying);
                                        }
                                        return 1;
                                    },
                                },
                            },
                            group: ['QD_huomo_1'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        global: ['phaseBegin'],
                                    },
                                    forced: true,
                                    popup: false,
                                    async content(event, trigger, player) {
                                        player.storage.QD_huomo = [];
                                    },
                                },
                            },
                        },
                        //佐定
                        // 其他角色使用♠️️️牌指定目标后,若其本回合未造成过伤害,你可以将其区域内一张牌交给目标之一
                        //——————————————————————————————————————————————————————————————————————————————————————————————————曹真
                        //司敌
                        //一名角色出牌阶段开始时,你可以将其一张牌当做<杀>对其使用,令其本回合不可使用或打出与此牌颜色相同的牌
                        QD_sidi: {
                            trigger: {
                                global: ['phaseUseBegin'],
                            },
                            forced: true,
                            filter(event, player) {
                                return event.player.countCards('he');
                            },
                            async content(event, trigger, player) {
                                const {
                                    result: { links },
                                } = await player.choosePlayerCard(trigger.player, 'he', 'visible').set('ai', (b) => sgn(trigger.player.isEnemiesOf(player)) * get.value(b.link));
                                if (links?.length) {
                                    trigger.player.addTempSkill('QD_sidi_1');
                                    trigger.player.storage.QD_sidi_1 = get.color(links[0]);
                                    player.useCard({ name: 'sha' }, links, trigger.player);
                                }
                            },
                            subSkill: {
                                1: {
                                    mod: {
                                        cardEnabled2(card, player) {
                                            if (get.color(card) == player.storage.QD_sidi_1) {
                                                return false;
                                            }
                                        },
                                    },
                                    mark: true,
                                    intro: {
                                        content(storage) {
                                            return `当前不可使用颜色${get.translation(storage)}`;
                                        },
                                    },
                                },
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————曹植
                        //落英
                        //任意角色<不因使用而>失去♣️️牌时,你获得之翻回正面.你的出牌阶段外,删除此技能括号内内容
                        QD_luoying: {
                            trigger: {
                                global: ['loseEnd'],
                            },
                            filter(event, player) {
                                if (_status.currentPhase == player && event.getParent('phaseUse', true)) {
                                    return !['recast', 'gift'].includes(event.getParent(2).name) && !['useCard', 'respond', 'equip'].includes(event.parent.name);
                                }
                                return event.cards && event.cards.some((q) => q.suit == 'club');
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                player.gain(
                                    trigger.cards.filter((q) => q.suit == 'club'),
                                    'gain2'
                                );
                                player.classList.remove('turnedover');
                            },
                        },
                        //酒诗
                        //你可以将一名正面朝上角色的武将牌翻面,视为使用一张酒
                        QD_jiushi: {
                            enable: ['chooseToUse', 'chooseToRespond'],
                            filter(event, player) {
                                return game.players.some((q) => !q.isTurnedOver()) && player.filterCard('jiu');
                            },
                            hiddenCard(player, name) {
                                return name == 'jiu' && game.players.some((q) => !q.isTurnedOver());
                            },
                            filterCard(card) {
                                return false;
                            },
                            selectCard: -1,
                            viewAs: { name: 'jiu' },
                            prompt: '将一名正面朝上角色的武将牌翻面,视为使用一张酒',
                            async precontent(event, trigger, player) {
                                const {
                                    result: { targets },
                                } = await player.chooseTarget('将一名正面朝上角色的武将牌翻面', (c, p, t) => !t.isTurnedOver(), true).set('ai', (t) => -get.attitude(player, t));
                                if (targets && targets[0]) {
                                    targets[0].turnOver();
                                }
                            },
                            ai: {
                                save: true,
                                order: 10,
                                result: {
                                    player(player, target, card) {
                                        if (player.getEnemies().some((q) => !q.isTurnedOver())) {
                                            return 10;
                                        }
                                        if (player.hp <= 0) {
                                            return 1;
                                        }
                                        return 0;
                                    },
                                },
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————曹仁
                        //据守
                        //一名角色结束阶段,你可以摸四张牌,使用其中一张牌,令其翻面
                        QD_jushou: {
                            trigger: {
                                global: ['phaseAfter'],
                            },
                            check(event, player) {
                                return event.player.isFriendsOf(player) == event.player.isTurnedOver();
                            },
                            prompt(event) {
                                return `摸四张牌,使用一张牌,令${get.translation(event.player)}翻面`;
                            },
                            async content(event, trigger, player) {
                                player.draw(4);
                                await player
                                    .chooseToUse((card) => player.filterCardx(card))
                                    .set('ai1', (card, arg) => {
                                        if (lib.card[card.name]) {
                                            return number0(player.getUseValue(card, null, true)) + 10;
                                        }
                                    });
                                trigger.player.turnOver();
                            },
                        },
                        //解围
                        //你可以将场上的牌当无懈可击使用
                        QD_jiewei: {
                            enable: ['chooseToUse', 'chooseToRespond'],
                            filter(event, player) {
                                return game.players.some((q) => q.countCards('ej')) && player.filterCard('wuxie');
                            },
                            hiddenCard(player, name) {
                                return name == 'wuxie' && game.players.some((q) => q.countCards('ej'));
                            },
                            filterCard(card) {
                                return false;
                            },
                            selectCard: -1,
                            viewAs: { name: 'wuxie' },
                            prompt: '将场上的牌当无懈可击使用',
                            async precontent(event, trigger, player) {
                                const {
                                    result: { targets },
                                } = await player.chooseTarget('将场上的牌当无懈可击使用', (c, p, t) => t.countCards('ej'), true).set('ai', (t) => -get.attitude(player, t));
                                if (targets && targets[0]) {
                                    const {
                                        result: { links },
                                    } = await player.choosePlayerCard(targets[0], true, 'ej', 'visible').set('ai', (b) => sgn(targets[0].isEnemiesOf(player)) * get.value(b.link));
                                    if (links?.length) {
                                        event.result.card.cards = links;
                                        event.result.cards = links;
                                    }
                                }
                            },
                            ai: {
                                order: 10,
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————夏侯渊
                        // 神速
                        // 你的阶段开始时,可以跳过之,并令一名其他角色跳过其下个相同的阶段
                        QD_shensu: {
                            trigger: {
                                player: ['phaseZhunbeiBefore', 'phaseJudgeBefore', 'phaseDrawBefore', 'phaseUseBefore', 'phaseDiscardBefore', 'phaseJieshuBefore'],
                            },
                            check(event, player) {
                                return true;
                            },
                            prompt(event) {
                                return `跳过${get.translation(event.name)},并令一名其他角色跳过其下个${get.translation(event.name)}`;
                            },
                            async content(event, trigger, player) {
                                trigger.cancel();
                                const {
                                    result: { targets },
                                } = await player.chooseTarget(`令一名其他角色跳过其下个${get.translation(trigger.name)}`, (c, p, t) => p != t && !t.skipList.includes(trigger.name)).set('ai', (t) => sgn(['phaseJudge', 'phaseDiscard'].includes(trigger.name)) * get.attitude(player, t));
                                if (targets && targets[0]) {
                                    targets[0].skip(trigger.name);
                                }
                            },
                        },
                        // 设变
                        // 当场上有人跳过阶段时,若此阶段为①摸牌阶段,你获得其他角色的至多两张牌②出牌阶段,你移动场上的一张牌
                        // 你可以视为对一名其他角色使用一张杀
                        QD_shebian: {
                            trigger: {
                                global: ['phaseZhunbeiCancelled', 'phaseJudgeCancelled', 'phaseDrawCancelled', 'phaseUseCancelled', 'phaseDiscardCancelled', 'phaseJieshuCancelled'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                if (trigger.name == 'phaseDraw') {
                                    let num = 2;
                                    while (num > 0) {
                                        const {
                                            result: { targets },
                                        } = await player.chooseTarget('获得其他角色的至多两张牌', (c, p, t) => p != t && t.countCards('he')).set('ai', (t) => -get.attitude(player, t));
                                        if (targets && targets[0]) {
                                            const {
                                                result: { links },
                                            } = await player.choosePlayerCard(targets[0], true, 'he', [1, num], 'visible').set('ai', (b) => get.value(b.link));
                                            if (links?.length) {
                                                num -= links.length;
                                                player.gain(links, 'gain2');
                                            } else {
                                                break;
                                            }
                                        } else {
                                            break;
                                        }
                                    }
                                } else if (trigger.name == 'phaseUse') {
                                    await player.moveCard();
                                }
                                player.chooseUseTarget({ name: 'sha' }, true, false, 'nodistance');
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————荀攸
                        //你可将所有黑色手牌当作任意一张普通锦囊牌使用,并摸一张牌
                        QD_qice: {
                            hiddenCard: (player, name) => lib.card[name]?.type == 'trick' && player.countCards('h', { color: 'black' }),
                            enable: 'chooseToUse',
                            filter(event, player) {
                                return player.qcard('trick').length && player.hasCard({ color: 'black' }, 'h');
                            },
                            chooseButton: {
                                dialog(event, player) {
                                    const list = player.qcard('trick');
                                    return ui.create.dialog('奇策', [list, 'vcard'], 'hidden');
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
                                    if (button.link[2] == 'wuzhong') {
                                        return 9999;
                                    }
                                    return number0(num) + 10;
                                },
                                backup(links, player) {
                                    return {
                                        audio: 'QD_qice',
                                        filterCard: { color: 'black' },
                                        selectCard: -1,
                                        position: 'h',
                                        viewAs: {
                                            name: links[0][2],
                                            nature: links[0][3],
                                            suit: links[0][0],
                                            number: links[0][1],
                                            storage: { [_status.event.buttoned]: true },
                                        },
                                        onuse(links, player) {
                                            player.draw();
                                        },
                                    };
                                },
                                prompt(links, player) {
                                    return '将' + get.translation(player.getCards('h', { color: 'black' })) + `当做${get.translation(links[0][2])}使用`;
                                },
                            },
                            ai: {
                                order(item, player) {
                                    if (player.countCards('h', { color: 'black' }) == 1) {
                                        return 99;
                                    }
                                    return 1;
                                },
                                result: {
                                    player: 1,
                                },
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————张让
                        //滔乱
                        //每阶段每种牌名限一次,你可以将一张牌当任意牌使用或打出,你选择一名角色令其选择①交给你一张牌②失去一点体力并随机失效一个技能
                        QD_taoluan: {
                            init(player) {
                                player.storage.QD_taoluan = [];
                            },
                            enable: ['chooseToUse', 'chooseToRespond'],
                            hiddenCard(player, name) {
                                return player.countCards('hes') && !player.storage.QD_taoluan.includes(name);
                            },
                            filter: (event, player) => player.countCards('hes') && player.qcard().some((q) => !player.storage.QD_taoluan.includes(q[2])),
                            chooseButton: {
                                dialog(event, player) {
                                    return ui.create.dialog('滔乱', [player.qcard().filter((q) => !player.storage.QD_taoluan.includes(q[2])), 'vcard']);
                                },
                                check(button) {
                                    if (['shan', 'tao', 'wuxie'].includes(button.link[2])) {
                                        return 99;
                                    }
                                    const player = _status.event.player;
                                    const num = player.getUseValue(
                                        {
                                            name: button.link[2],
                                            nature: button.link[3],
                                        },
                                        null,
                                        true
                                    );
                                    if (['wuzhong', 'dongzhuxianji'].includes(button.link[2]) && player.countCards('h') < 4) {
                                        return number0(num) * 2 + 10;
                                    }
                                    return number0(num) + 10;
                                },
                                backup(links, player) {
                                    return {
                                        filterCard: true,
                                        selectCard: 1,
                                        position: 'hes',
                                        check: (card) => 12 - get.value(card),
                                        viewAs: {
                                            name: links[0][2],
                                            nature: links[0][3],
                                            suit: links[0][0],
                                            number: links[0][1],
                                        },
                                        async precontent(event, trigger, player) {
                                            game.log('#g【滔乱】', event.result.card);
                                            player.storage.QD_taoluan.add(event.result.card.name);
                                            player.popup(event.result.card, 'thunder');
                                            const {
                                                result: { targets },
                                            } = await player.chooseTarget('选择一名角色令其选择①交给你一张牌②失去一点体力并随机失效一个技能', (c, p, t) => p != t, true).set('ai', (t) => -get.attitude(player, t));
                                            if (targets && targets[0]) {
                                                const {
                                                    result: { cards },
                                                } = await targets[0].chooseToGive(player).set('ai', (c) => 8 - get.value(c));
                                                if (cards && cards[0]) {
                                                } else {
                                                    targets[0].loseHp();
                                                    const skill = game.filterSkills(targets[0].GAS(), targets[0]).randomGet();
                                                    if (skill) {
                                                        if (_status.currentPhase == targets[0]) {
                                                            targets[0].tempBanSkill(skill, { player: 'phaseBefore' });
                                                        } else {
                                                            targets[0].tempBanSkill(skill, { player: 'phaseAfter' });
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                    };
                                },
                                prompt(links, player) {
                                    return '将一张牌当做' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '使用';
                                },
                            },
                            ai: {
                                fireAttack: true,
                                save: true,
                                respondSha: true,
                                respondShan: true,
                                skillTagFilter(player, tag, arg) {
                                    return Boolean(player.countCards('hes'));
                                },
                                order: 10,
                                result: {
                                    player(player) {
                                        if (_status.event.dying) {
                                            return get.attitude(player, _status.event.dying);
                                        }
                                        return 1;
                                    },
                                },
                            },
                            group: ['QD_taoluan_1'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        global: ['phaseEnd', 'phaseZhunbeiEnd', 'phaseJudgeEnd', 'phaseDrawEnd', 'phaseUseEnd', 'phaseDiscardEnd', 'phaseJieshuEnd'],
                                    },
                                    silent: true,
                                    async content(event, trigger, player) {
                                        player.storage.QD_taoluan = [];
                                    },
                                },
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————吕蒙
                        //克己
                        // 一名角色弃牌阶段结束时,你摸其弃牌数两倍的牌
                        QD_keji: {
                            trigger: {
                                global: ['phaseDiscardEnd'],
                            },
                            forced: true,
                            filter(event, player) {
                                return event.cards?.length;
                            },
                            async content(event, trigger, player) {
                                player.draw(2 * trigger.cards.length);
                            },
                        },
                        //博圖
                        // 当一名角色回合结束时,若此回合全场角色累计失去过的牌包含四种花色,你可以立即执行一个额外的回合
                        QD_botu: {
                            mark: true,
                            intro: {
                                content(s, p) {
                                    return `当前全场角色累计失去过的牌包含${game
                                        .lose()
                                        .map((q) => q.suit)
                                        .unique().length
                                        }种花色`;
                                },
                            },
                            trigger: {
                                global: ['phaseAfter'],
                            },
                            forced: true,
                            filter(event, player) {
                                return (
                                    game
                                        .lose()
                                        .map((q) => q.suit)
                                        .unique().length > 3
                                );
                            },
                            async content(event, trigger, player) {
                                player.phase('nodelay');
                            },
                        },
                        //攻心
                        // 阶段限一次,当你<使用牌指定其他角色为目标/成为其他角色使用牌的目标>时,你观看对方牌并获得每种花色各一张
                        QD_gongxin: {
                            trigger: {
                                player: ['useCardToPlayer'],
                                target: ['useCardToPlayer'],
                            },
                            forced: true,
                            filter(event, player) {
                                if (_status.jieduan.QD_gongxin) {
                                    return false;
                                }
                                if (event.player == player) {
                                    return event.target != player && event.target.countCards('he');
                                }
                                return event.player.countCards('he');
                            },
                            async content(event, trigger, player) {
                                _status.jieduan.QD_gongxin = true;
                                const target = trigger.player == player ? trigger.target : trigger.player;
                                const {
                                    result: { links },
                                } = await player
                                    .choosePlayerCard(target, 'he', [1, 5], 'visible')
                                    .set('filterButton', (b) => {
                                        for (const i of ui.selected.buttons) {
                                            if (i.link.suit == b.link.suit) {
                                                return false;
                                            }
                                        }
                                        return true;
                                    })
                                    .set('ai', (b) => get.value(b.link));
                                if (links?.length) {
                                    player.gain(links, 'gain2');
                                }
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————钟琰
                        QD_bolan: {
                            init(player) {
                                player.storage.QD_bolan = ['dcjincui', 'dczhengyue', 'sbwusheng', 'pingjian', 'qingbei', 'dccansi', 'xingchong', 'syjiqiao', 'xinshanjia', 'dcpoyuan', 'dctongye', 'dczhanjue', 'shencai', 'yufeng', 'yanru', 'luochong', 'dcmanzhi', 'zhengjing', 'mbkuangli', 'dcxiaowu', 'dcsilun', 'dcwoheng', 'dunshi', 'dcsbwuwei', 'dcjiezhen', 'kuangcai', 'clananran', 'dcdufeng', 'dczhanmeng', 'tongli', 'dcluochong', 'lkbushi', 'dcjigu', 'dcshuangrui', 'dczhimin', 'xianmou', 'dcjianzhuan', 'mbqianlong', 'dcxiaoxi', 'pianchong', 'spolzhouxuan', 'starliangyan', 'olsbliwen', 'dczhaowen', 'dcxiongmu', 'olqingshu', 'reshuishi', 'shanduan', 'clanyuzhi', 'dcfuning', 'dczhongji', 'dchuishu', 'dcfuxue', 'shenzhu', 'zhiren', 'dcsbzuojun', 'sbyingzi', 'dcqingshi', 'olxianying', 'rezhiheng', 'xinjianying', 'refenyin', 'neifa', 'sbjushou', 'dcshuangjia'];
                            },
                            trigger: {
                                global: ['phaseBegin'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                player.addAdditionalSkill('QD_bolan', player.storage.QD_bolan.randomGets(2));
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————孙皓
                        // 残蚀
                        // 已受伤角色回合开始时,你摸全场已受伤角色数的牌.其他未受伤角色失去牌时,随机弃置一张牌
                        QD_canshi: {
                            trigger: {
                                global: ['phaseBefore'],
                            },
                            forced: true,
                            filter(event, player) {
                                return event.player.hp < event.player.maxHp;
                            },
                            async content(event, trigger, player) {
                                const num = game.players.filter((q) => q.hp < q.maxHp).length;
                                player.draw(num);
                            },
                            group: ['QD_canshi_1'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        global: ['loseEnd'],
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return event.player.hp >= event.player.maxHp && event.player != player && event.player.countCards('he') && !event.getParent('QD_canshi_1', true);
                                    },
                                    async content(event, trigger, player) {
                                        trigger.player.randomDiscard('he');
                                    },
                                },
                            },
                        },
                        // 仇海
                        // 当你<受到伤害/造成伤害>时,若对方手牌数不大于你,此伤害<-1/+1>
                        QD_chouhai: {
                            trigger: {
                                player: ['damageBefore'],
                                source: ['damageBefore'],
                            },
                            forced: true,
                            filter(event, player) {
                                if (!event.source) {
                                    return true;
                                }
                                const num1 = event.source.countCards('h');
                                const num2 = event.player.countCards('h');
                                if (event.player == player) {
                                    return num2 >= num1;
                                }
                                return num1 >= num2;
                            },
                            async content(event, trigger, player) {
                                if (trigger.player == player) {
                                    trigger.num--;
                                } else {
                                    trigger.num++;
                                }
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————张芝
                        // 笔心
                        // 任意角色的准备阶段/结束阶段,你可以声明一种牌的类型,并选择一种基本牌.你摸3张牌,将当前回合角色所有此类型的牌当此基本牌使用
                        QD_bixin: {
                            trigger: {
                                global: ['phaseZhunbeiBegin', 'phaseJieshuBegin'],
                            },
                            forced: true,
                            filter(event, player) {
                                return _status.currentPhase;
                            },
                            async content(event, trigger, player) {
                                const cards = _status.currentPhase.getCards('he');
                                const {
                                    result: { links },
                                } = await player.chooseButton(['请选择类型', [lib.type.map((i) => [i, get.translation(i)]), 'tdnodes']]).set('ai', (b) => {
                                    if (_status.currentPhase.isFriendsOf(player)) {
                                        return 5 - cards.filter((q) => get.type(q) == b.link).length;
                                    }
                                    return cards.filter((q) => get.type(q) == b.link).length;
                                });
                                if (links && links[0]) {
                                    const {
                                        result: { links: links1 },
                                    } = await player.chooseButton(['选择一种基本牌', [player.qcard('basic', true, false), 'vcard']]).set('ai', (button) => {
                                        const num = player.getUseValue(
                                            {
                                                name: button.link[2],
                                                nature: button.link[3],
                                            },
                                            null,
                                            true
                                        );
                                        return number0(num) + 10;
                                    });
                                    if (links1 && links1[0]) {
                                        player.draw(3);
                                        const cards1 = cards.filter((q) => get.type(q) == links[0]);
                                        player.chooseUseTarget({ name: links1[0][2], nature: links1[0][3], cards: cards1 }, cards1).set('nodistance', true).set('addCount', false);
                                    }
                                }
                            },
                        },
                        // 飞白
                        // 当你因执行非黑/红色牌的效果而造成伤害/回复时,此数值翻倍
                        QD_feibai: {
                            trigger: {
                                source: ['damageBefore'],
                                player: ['recoverBefore'],
                            },
                            forced: true,
                            filter(event, player, name) {
                                if (event.card) {
                                    if (name == 'damageBefore') {
                                        return get.color(event.card) != 'black';
                                    }
                                    return get.color(event.card) != 'red';
                                }
                            },
                            async content(event, trigger, player) {
                                trigger.num = numberq1(trigger.num) * 2;
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————曹操
                        // 奸雄
                        // 任意角色受到伤害后,你获得造成伤害的牌并摸一张牌(以此法获得的牌,每回合限用一次,且不计入手牌上限)
                        QD_jianxiong: {
                            mod: {
                                ignoredHandcard(card, player) {
                                    if (card.gaintag?.includes('QD_jianxiong')) {
                                        return true;
                                    }
                                },
                                cardEnabled2(card, player) {
                                    if (player.storage.QD_jianxiong.includes(card)) {
                                        return false;
                                    }
                                },
                            },
                            init(player) {
                                player.storage.QD_jianxiong = [];
                            },
                            trigger: {
                                global: ['damageAfter'],
                            },
                            forced: true,
                            filter(event, player) {
                                return event.cards?.length;
                            },
                            async content(event, trigger, player) {
                                player.gain(trigger.cards, 'gain2').gaintag = ['QD_jianxiong'];
                                player.draw();
                            },
                            group: ['QD_jianxiong_1', 'QD_jianxiong_2'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        player: ['useCardBegin'],
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        return event.cards?.some((q) => q.gaintag?.includes('QD_jianxiong'));
                                    },
                                    async content(event, trigger, player) {
                                        for (const card of trigger.cards.filter((q) => q.gaintag?.includes('QD_jianxiong'))) {
                                            player.storage.QD_jianxiong.add(card);
                                        }
                                    },
                                },
                                2: {
                                    trigger: {
                                        global: ['phaseAfter'],
                                    },
                                    forced: true,
                                    popup: false,
                                    async content(event, trigger, player) {
                                        player.storage.QD_jianxiong = [];
                                    },
                                },
                            },
                        },
                        // 護駕
                        // 当你需要使用或打出【闪】时,你可以令任意其他角色替你打出【闪】,没打出【闪】的角色受到一点伤害
                        QD_hujia: {
                            trigger: {
                                player: ['chooseToRespondBefore', 'chooseToUseBefore'],
                            },
                            forced: true,
                            filter(event, player) {
                                return player.filterCard('shan');
                            },
                            hiddenCard(player, name) {
                                return name == 'shan';
                            },
                            async content(event, trigger, player) {
                                const {
                                    result: { targets },
                                } = await player.chooseTarget('令任意其他角色替你打出【闪】', (c, p, t) => p != t).set('ai', (t) => -get.attitude(player, t));
                                if (targets && targets[0]) {
                                    for (const npc of targets) {
                                        const { result } = await npc.chooseToRespond('替' + get.translation(player) + '打出一张闪或受到一点伤害', { name: 'shan' });
                                        if (result?.bool) {
                                            trigger.result = { bool: true, card: result.card };
                                            trigger.responded = true;
                                        } else {
                                            npc.damage();
                                        }
                                    }
                                }
                            },
                            ai: {
                                respondShan: true, //不加这个,只靠hiddencard不够,因为杀在你需要响应闪之前就检测你是否有闪,这时候你的filter由于不是响应闪的时机所以不通过,所以导致hiddencard检测没有闪
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————沮授 监军谋国 2/3 3护甲
                        // 矢北
                        // 当任意角色受到伤害后,若是其本回合首次受到伤害,你回复一点体力,否则你令一名其他角色失去一点体力
                        QD_shibei: {
                            trigger: {
                                global: ['damage'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                const his = trigger.player.actionHistory;
                                const evt = his[his.length - 1];
                                if (evt.damage.length > 1) {
                                    const {
                                        result: { targets },
                                    } = await player.chooseTarget('令一名其他角色失去一点体力', (c, p, t) => p != t).set('ai', (t) => -get.attitude(player, t));
                                    if (targets && targets[0]) {
                                        targets[0].loseHp();
                                    }
                                } else {
                                    player.recover();
                                }
                            },
                        },
                        // 渐营
                        // 当任意牌被使用时,若此牌与上一张被使用的牌点数或花色相同,你摸一张牌
                        QD_jianying: {
                            mod: {
                                aiOrder(player, card, num) {
                                    const log = player.storage.QD_jianying;
                                    if (lib.card[card.name] && log) {
                                        if (card.number == log.number || card.suit == log.suit) {
                                            return num + 10;
                                        }
                                    }
                                },
                            },
                            trigger: {
                                global: ['useCard'],
                            },
                            forced: true,
                            filter(event, player) {
                                if (!player.storage.QD_jianying) {
                                    player.storage.QD_jianying = event.card;
                                }
                                const log = player.storage.QD_jianying;
                                player.storage.QD_jianying = event.card;
                                return event.card.number == log.number || event.card.suit == log.suit;
                            },
                            async content(event, trigger, player) {
                                player.draw();
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————徐盛 江东的铁壁 4/4
                        // 破军
                        // 当任意其他角色成为【杀】的目标后,你可以获得其至多体力值张牌
                        // 若你的装备区里没有武器牌时,你视为装备【古锭刀】
                        QD_pojun: {
                            trigger: {
                                global: ['shaBegin'],
                            },
                            forced: true,
                            filter(event, player) {
                                return event.target?.countCards('he') && event.target != player;
                            },
                            async content(event, trigger, player) {
                                player.gainPlayerCard(trigger.target, 'he', [1, trigger.target.hp], 'visible').set('ai', (b) => get.value(b.link));
                            },
                            group: ['QD_pojun_1'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        source: ['damageBegin1'],
                                    },
                                    filter(event, player) {
                                        return event.card?.name == 'sha' && !event.player.countCards('h') && !player.getEquip(1);
                                    },
                                    forced: true,
                                    async content(event, trigger, player) {
                                        trigger.num++;
                                    },
                                },
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————卢植
                        // 明任
                        // 每轮开始时,你摸两张牌,将一张牌称为<任>置于武将牌上
                        QD_mingren: {
                            trigger: {
                                global: ['roundStart'],
                            },
                            forced: true,
                            intro: {
                                content: 'expansion',
                            },
                            async content(event, trigger, player) {
                                await player.draw(2);
                                if (player.countCards('he')) {
                                    const {
                                        result: { cards },
                                    } = await player.chooseCard('he', true).set('ai', (c) => 6 - get.value(c));
                                    if (cards && cards[0]) {
                                        player.addToExpansion(cards).gaintag.add('QD_mingren');
                                    }
                                }
                            },
                        },
                        // 贞良
                        // 出牌阶段限一次,你可以弃置场上与你区域内任意张与<任>花色相同的牌,分配等量伤害
                        // 当任意牌被使用后,若此牌与<任>花色相同,你摸一张牌
                        QD_zhenliang: {
                            enable: 'phaseUse',
                            usable: 1,
                            filter(event, player) {
                                const suits = player
                                    .getExpansions('QD_mingren')
                                    .map((q) => q.suit)
                                    .unique();
                                const cards = player.getCards('he');
                                for (const i of game.players) {
                                    cards.addArray(i.getCards('ej'));
                                }
                                return cards.some((c) => suits.includes(c.suit));
                            },
                            async content(event, trigger, player) {
                                const suits = player
                                    .getExpansions('QD_mingren')
                                    .map((q) => q.suit)
                                    .unique();
                                const list = ['请选择卡牌'];
                                for (const i of game.players) {
                                    const card1 = i.getCards('hej').filter((c) => suits.includes(c.suit));
                                    const card2 = i.getCards('ej').filter((c) => suits.includes(c.suit));
                                    if (i == player && card1.length) {
                                        list.add(`你的牌`);
                                        list.add(card1);
                                    } else if (card2.length) {
                                        list.add(`${get.translation(i)}的牌`);
                                        list.add(card2);
                                    }
                                }
                                const {
                                    result: { links },
                                } = await player.chooseButton(list, [1, 9]).set('ai', (b) => {
                                    return 8 - sgn(get.owner(b.link).isFriendsOf(player)) * get.value(b.link, player);
                                });
                                if (links && links[0]) {
                                    game.log(links, '进入弃牌堆');
                                    game.cardsDiscard(links);
                                    let num = links.length;
                                    while (num-- > 0) {
                                        const {
                                            result: { targets },
                                        } = await player.chooseTarget('分配伤害', (c, p, t) => p != t).set('ai', (t) => -get.attitude(player, t));
                                        if (targets && targets[0]) {
                                            targets[0].damage();
                                        }
                                    }
                                }
                            },
                            ai: {
                                order: 3,
                                result: {
                                    player: 2,
                                },
                            },
                            group: ['QD_zhenliang_1'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        global: ['useCard'],
                                    },
                                    forced: true,
                                    filter(event, player) {
                                        const suits = player
                                            .getExpansions('QD_mingren')
                                            .map((q) => q.suit)
                                            .unique();
                                        return suits.includes(event.card.suit);
                                    },
                                    async content(event, trigger, player) {
                                        player.draw();
                                    },
                                },
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————彭羕
                        // 嚣翻
                        // 你可以将牌堆底4张牌如手牌般使用/打出
                        QD_xiaofan: {
                            trigger: {
                                player: ['chooseToUseBegin', 'chooseToRespondBegin'],
                            },
                            forced: true,
                            firstDo: true,
                            popup: false,
                            async content(event, trigger, player) {
                                const cards = Array.from(ui.cardPile.childNodes).slice(-4);
                                const cardx = player.getCards('s', (c) => c.gaintag?.includes('QD_xiaofan'));
                                cards.forEach((card1, index, arr) => {
                                    let card2 = cardx[index];
                                    if (!card2) {
                                        card2 = game.createCard(card1);
                                        card2._cardid3 = card1.cardid;
                                        player.directgains([card2], null, 'QD_xiaofan');
                                    }
                                    if (card2._cardid3 != card1.cardid) {
                                        card2.init(card1);
                                        card2._cardid3 = card1.cardid;
                                    }
                                });
                            },
                            ai: {
                                effect: {
                                    player(card, player, target) {
                                        if (lib.card[card.name] && !player.getCards('h').includes(card)) {
                                            return [1, 999]; //无脑用牌
                                        }
                                    },
                                },
                            },
                            group: ['QD_xiaofan_1'],
                            subSkill: {
                                1: {
                                    trigger: {
                                        player: ['useCardBefore', 'respondBefore'],
                                    },
                                    forced: true,
                                    popup: false,
                                    firstDo: true,
                                    filter(event, player) {
                                        return event.cards?.some((card) => card._cardid3);
                                    },
                                    async content(event, trigger, player) {
                                        const cards = Array.from(ui.cardPile.childNodes).slice(-4);
                                        for (const card of trigger.cards) {
                                            const cardx = cards.find((q) => q.cardid == card._cardid3);
                                            if (cardx) {
                                                cardx.delete();
                                            }
                                        }
                                    },
                                },
                            },
                        },
                        // 侻失
                        // 你使用非手牌时,无距离次数限制,并弃置一名角色前X个区域中的所有牌:武将牌上/判定区/装备区/手牌区(X为本回合你使用过牌的类型数)
                        QD_duishi: {
                            mod: {
                                cardUsable(card, player, num) {
                                    const cards = card.cards;
                                    if (!cards || !cards.length || cards.some((c) => !player.getCards('h').includes(c))) {
                                        return Infinity;
                                    }
                                },
                                targetInRange(card, player) {
                                    const cards = card.cards;
                                    if (!cards || !cards.length || cards.some((c) => !player.getCards('h').includes(c))) {
                                        return true;
                                    }
                                },
                            },
                            trigger: {
                                player: ['useCardBegin'],
                            },
                            forced: true,
                            filter(event, player) {
                                const his = player.actionHistory;
                                const evt = his[his.length - 1];
                                if (evt.useCard.some((e) => get.type(e.card) == get.type(event.card))) {
                                    return false;
                                }
                                return !event.cards || !event.cards.length || event.cards.some((c) => !player.getCards('h').includes(c));
                            },
                            async content(event, trigger, player) {
                                const type = [];
                                const his = player.actionHistory;
                                const evt = his[his.length - 1];
                                for (const e of evt.useCard) {
                                    type.add(get.type(e.card));
                                }
                                const {
                                    result: { targets },
                                } = await player.chooseTarget(`弃置一名角色前${type.length}个区域中的所有牌`).set('ai', (t) => {
                                    let value = 0;
                                    const sgn = window.sgn(t.isEnemiesOf(player));
                                    if (type.length > 1) {
                                        for (const card of t.getCards('j')) {
                                            value += get.effect(t, card, player, player) * sgn;
                                        }
                                    }
                                    if (type.length > 2) {
                                        for (const card of t.getCards('e')) {
                                            value += get.value(card, t) * sgn;
                                        }
                                    }
                                    if (type.length > 3) {
                                        for (const card of t.getCards('h')) {
                                            value += get.value(card, t) * sgn;
                                        }
                                    }
                                    return value;
                                });
                                if (targets && targets[0]) {
                                    if (type.length) {
                                        targets[0].discard(targets[0].getCards('x'));
                                    }
                                    if (type.length > 1) {
                                        targets[0].discard(targets[0].getCards('j'));
                                    }
                                    if (type.length > 2) {
                                        targets[0].discard(targets[0].getCards('e'));
                                    }
                                    if (type.length > 3) {
                                        targets[0].discard(targets[0].getCards('h'));
                                    }
                                }
                            },
                        },
                        // 寸目
                        // 敌方角色不能使用【无懈可击】.敌方角色使用点数为字母的牌时,你令此牌无效并摸一张牌
                        // 敌方角色使用伤害牌累计未造成伤害三次后,你令其失效一个技能
                        QD_cunmu: {
                            trigger: {
                                global: ['useCard'],
                            },
                            forced: true,
                            filter(event, player) {
                                return event.player.isEnemiesOf(player) && (event.card.number > 10 || event.card.number < 2);
                            },
                            async content(event, trigger, player) {
                                trigger.all_excluded = true;
                                player.draw();
                            },
                            global: ['QD_cunmu_1'],
                            subSkill: {
                                1: {
                                    cardEnabled(card, player) {
                                        const boss = game.players.find((q) => q.hasSkill('QD_cunmu'));
                                        if (card.name == 'wuxie' && boss && player.isEnemiesOf(boss)) {
                                            return false;
                                        }
                                    },
                                    trigger: {
                                        player: ['useCardEnd'],
                                    },
                                    forced: true,
                                    intro: {
                                        content: 'mark',
                                    },
                                    filter(event, player) {
                                        const boss = game.players.find((q) => q.hasSkill('QD_cunmu'));
                                        const his = player.actionHistory;
                                        const evt = his[his.length - 1];
                                        return boss && player.isEnemiesOf(boss) && get.tag(event.card, 'damage') && evt.sourceDamage.every((evtx) => evtx.getParent(2) != event);
                                    },
                                    async content(event, trigger, player) {
                                        player.addMark('QD_cunmu_1');
                                        if (player.storage.QD_cunmu_1 > 2) {
                                            player.storage.QD_cunmu_1 = 0;
                                            const skill = player
                                                .GAS()
                                                .filter((s) => !player.disabledSkills[s])
                                                .randomGet();
                                            if (skill) {
                                                player.disableSkill('QD_cunmu_1', skill);
                                            }
                                        }
                                    },
                                },
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————程普
                        // 疠火
                        // 你的【杀】视为火属性且可以额外指定一个目标
                        // 你使用杀指定目标后,令目标失去一点体力并随机弃置一张牌
                        QD_lihuo: {
                            mod: {
                                selectTarget(card, player, range) {
                                    if (card.name == 'sha') {
                                        range[1] += 1;
                                    }
                                },
                            },
                            trigger: {
                                player: ['shaBegin'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                trigger.card.nature == 'fire';
                                trigger.target.loseHp();
                                trigger.target.randomDiscard('he');
                            },
                        },
                        // 醇醪
                        // 任意【杀】被失去后,你将其称为<醇>置于武将牌上
                        // 你可以将<醇>当任意基本牌使用或打出
                        QD_chunliao: {
                            trigger: {
                                global: ['loseEnd'],
                            },
                            forced: true,
                            mark: true,
                            intro: {
                                content: 'expansion',
                            },
                            filter(event, player) {
                                return event.cards?.some((c) => c.name == 'sha') && event.parent.skill != 'QD_chunliao_1_backup';
                            },
                            async content(event, trigger, player) {
                                const cards = trigger.cards.filter((c) => c.name == 'sha');
                                player.addToExpansion(cards).gaintag = ['QD_chunliao'];
                            },
                            group: ['QD_chunliao_1'],
                            subSkill: {
                                1: {
                                    hiddenCard(player, name) {
                                        return get.type(name) == 'basic' && player.getExpansions('QD_chunliao').length;
                                    },
                                    enable: ['chooseToUse', 'chooseToRespond'],
                                    filter(event, player) {
                                        return player.qcard('basic').length && player.getExpansions('QD_chunliao').length;
                                    },
                                    chooseButton: {
                                        dialog(event, player) {
                                            return ui.create.dialog('醇醪', [player.qcard('basic'), 'vcard'], 'hidden');
                                        },
                                        check(button, buttons) {
                                            const player = _status.event.player;
                                            const num = player.getUseValue(
                                                {
                                                    name: button.link[2],
                                                    nature: button.link[3],
                                                },
                                                null,
                                                true
                                            ); //null是距离限制//true是用牌次数限制
                                            return number0(num) + 10; //不加这行会出现有button返回undefined导致无法判断直接结束回合
                                        }, //有些高手写的卡牌返回NAN也会导致无法判断,所以用 Number
                                        backup(links, player) {
                                            return {
                                                filterCard: () => false,
                                                selectCard: -1,
                                                viewAs: {
                                                    name: links[0][2],
                                                    nature: links[0][3],
                                                    suit: links[0][0],
                                                    number: links[0][1],
                                                },
                                                ignoreMod: true,
                                                async precontent(event, trigger, player) {
                                                    const cards = player.getExpansions('QD_chunliao').randomGets(1);
                                                    event.result.cards = cards;
                                                    event.result.card.cards = cards;
                                                },
                                            };
                                        },
                                        prompt(links, player) {
                                            return '将一名角色武将牌横置并视为使用基本牌';
                                        },
                                    },
                                    ai: {
                                        save: true,
                                        respondSha: true,
                                        respondShan: true,
                                        skillTagFilter(player, tag, arg) {
                                            return Boolean(player.getExpansions('QD_chunliao').length);
                                        },
                                        order: 20,
                                        result: {
                                            player(player) {
                                                if (_status.event.dying) {
                                                    return get.attitude(player, _status.event.dying);
                                                }
                                                return 10;
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————徐氏
                        // 问卦
                        // 其他角色出牌阶段开始时,你获得其一张牌称为<卦>,你可以将其手牌与牌堆顶x张牌任意交换(x为其手牌数)
                        // 卦象凶险,汝,恐有血光之灾
                        QD_wengua: {
                            trigger: {
                                global: ['phaseUseBegin'],
                            },
                            forced: true,
                            lastDo: true,
                            filter(event, player) {
                                return event.player.countCards('he') && event.player != player;
                            },
                            async content(event, trigger, player) {
                                const {
                                    result: { links },
                                } = await player.gainPlayerCard('he', trigger.player, true).set('gaintag', ['QD_wengua']);
                                const cardx = trigger.player.getCards('h');
                                if (cardx.length) {
                                    const cardtop = get.cards(cardx.length);
                                    const {
                                        result: { moved },
                                    } = await player
                                        .chooseToMove()
                                        .set('list', [
                                            ['手牌', cardx],
                                            ['牌堆顶', cardtop],
                                        ])
                                        .set('prompt', '将其手牌与牌堆顶牌任意交换')
                                        .set('filterMove', function (from, to) {
                                            return typeof to != 'number';
                                        })
                                        .set('processAI', function (list) {
                                            const cards = cardtop.concat(cardx);
                                            cards.sort((a, b) => {
                                                if (get.attitude(player, trigger.player) > 0) {
                                                    return get.value(b) - get.value(a);
                                                }
                                                return get.value(a) + (get.tag(a, 'damage') ? 5 : -5) - get.value(b) - (get.tag(b, 'damage') ? 5 : -5);
                                            });
                                            return [cards.slice(0, cardx.length), cards.slice(cardx.length)];
                                        }); //给别人观星
                                    if (moved?.length) {
                                        trigger.player.gain(moved[0], 'gain2');
                                        moved[1].reverse();
                                        for (const i of moved[1]) {
                                            ui.cardPile.insertBefore(i, ui.cardPile.firstChild);
                                        }
                                        game.log(`${get.translation(moved[1])}置于牌堆顶`);
                                    }
                                }
                            },
                        },
                        // 伏诛
                        // 其他角色出牌阶段结束时,你可以弃置区域内所有<卦>,展示牌堆顶10x张牌,对其使用其中所有伤害牌(x为你弃置的<卦>数)
                        QD_fuzhu: {
                            trigger: {
                                global: ['phaseUseEnd'],
                            },
                            check(event, player) {
                                return event.player.isEnemiesOf(player);
                            },
                            filter(event, player) {
                                return player.hasCard((c) => c.hasGaintag('QD_wengua'), 'hej') && event.player != player;
                            },
                            firstDo: true,
                            async content(event, trigger, player) {
                                const cards = player.getCards('hej', (c) => c.hasGaintag('QD_wengua'));
                                const cardstop = get.cards(cards.length * 10);
                                player.discard(cards);
                                player.showCards(cardstop);
                                const cardsdamage = cardstop.filter((c) => get.tag(c, 'damage'));
                                for (const c of cardsdamage) {
                                    await player.useCard(c, trigger.player);
                                }
                            },
                        },
                        //——————————————————————————————————————————————————————————————————————————————————————————————————刘备
                        // 仁德
                        // 出牌阶段,你可以获得其他角色的牌.每当你以此法累计获得两张牌后,你可以视为使用一张基本牌(无距离次数限制)
                        QD_rende: {
                            init(player) {
                                player.storage.QD_rende = 0;
                            },
                            audio: 'rerende',
                            enable: 'phaseUse',
                            filter(event, player) {
                                return game.players.some((Q) => Q.countCards('he') && Q != player);
                            },
                            filterTarget(card, player, target) {
                                return player != target && target.countCards('he');
                            },
                            selectTarget: 1,
                            async content(event, trigger, player) {
                                const {
                                    result: { links },
                                } = await player.choosePlayerCard(event.target, 'he', [1, event.target.countCards('he')], 'visible').set('ai', (b) => get.value(b.link));
                                if (links?.length) {
                                    await player.gain(links, 'gain2');
                                    player.storage.QD_rende += links.length;
                                    while (player.storage.QD_rende > 1) {
                                        player.storage.QD_rende -= 2;
                                        const list = player.qcard('basic', true, false);
                                        if (list.length) {
                                            const { result } = await player.chooseButton(['视为使用一张基本牌', [list, 'vcard']]).set('ai', function (button) {
                                                const player = _status.event.player;
                                                const num = player.getUseValue(
                                                    {
                                                        name: button.link[2],
                                                        nature: button.link[3],
                                                    },
                                                    null,
                                                    true
                                                ); //null是距离限制//true是用牌次数限制
                                                return number0(num) + 10;
                                            });
                                            if (result?.links?.length) {
                                                await player.chooseUseTarget({ name: result.links[0][2], nature: result.links[0][3] }, true, false, 'nodistance');
                                            }
                                        }
                                    }
                                }
                            },
                            ai: {
                                fireAttack: true,
                                order: 20,
                                result: {
                                    player(player, target) {
                                        return target.countCards('he') + 2;
                                    },
                                    target(player, target) {
                                        return -target.countCards('he');
                                    },
                                },
                            },
                        },
                        // 激将
                        // 当你需要砍人时,你可令一名有杀的角色替你使用与打出
                        激将: {
                            audio: 'jijiang1',
                            forced: true,
                            enable: ['chooseToUse', 'chooseToRespond'],
                            usable: 5, //QQQ
                            filter(event, player) {
                                return game.players.some((Q) => Q.countCards('h', { name: 'sha' }) && Q != player) && player.filterCard('sha', true);
                            }, //QQQ
                            hiddenCard(player, name) {
                                return game.players.some((Q) => Q.countCards('h', { name: 'sha' }) && Q != player) && name == 'sha';
                            },
                            async content(event, trigger, player) {
                                const evt = event.getParent(2);
                                for (const i of game.players) {
                                    if (i == player) {
                                        continue;
                                    }
                                    if (i.countCards('h', { name: 'sha' })) {
                                        const { result } = await i.chooseToRespond(`替${get.translation(player)}打出一张杀`, true, { name: 'sha' });
                                        if (result.cards && result.cards[0]) {
                                            if (evt.name == 'chooseToUse') {
                                                player.when('useCard').then(() => trigger.directHit.addArray(game.players));
                                                await player.chooseUseTarget('sha', true, false, 'nodistance');
                                            } else {
                                                evt.untrigger();
                                                evt.set('responded', true);
                                                evt.result = { bool: true, card: { name: 'sha' }, cards: [] };
                                                evt.redo();
                                            }
                                        }
                                    }
                                }
                            },
                            ai: {
                                respondSha: true,
                                skillTagFilter(player, tag, arg) {
                                    return game.players.some((Q) => Q.countCards('h', { name: 'sha' }) && Q != player);
                                },
                                order: 20,
                                result: {
                                    player: 1,
                                },
                            },
                        },
                    },
                    translate: {
                        //——————————————————————————————————————————————————————————————————————————————————————————————————刘备
                        QD_刘备: '刘备',
                        QD_rende: '仁德',
                        QD_rende_info: '出牌阶段,你可以获得其他角色的牌.每当你以此法累计获得两张牌后,你可以视为使用一张基本牌(无距离次数限制)',
                        激将: '激将',
                        激将_info: '当你需要砍人时,你可令一名有杀的角色替你使用与打出',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————徐氏
                        QD_xushi: '徐氏',
                        QD_wengua: '问卦',
                        QD_wengua_info: '其他角色出牌阶段开始时,你获得其一张牌称为<卦>,你可以将其手牌与牌堆顶x张牌任意交换(x为其手牌数)',
                        QD_wengua_append: '卦象凶险,汝,恐有血光之灾',
                        QD_fuzhu: '伏诛',
                        QD_fuzhu_info: '其他角色出牌阶段结束时,你可以弃置区域内所有<卦>,展示牌堆顶10x张牌,对其使用其中所有伤害牌(x为你弃置的<卦>数)',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————程普
                        QD_chengpu: '程普',
                        QD_lihuo: '疠火',
                        QD_lihuo_info: '你的【杀】视为火属性且可以额外指定一个目标<br>你使用杀指定目标后,令目标失去一点体力并随机弃置一张牌',
                        QD_chunliao: '醇醪',
                        QD_chunliao_info: '任意【杀】被失去后,你将其称为<醇>置于武将牌上<br>你可以将<醇>当任意基本牌使用或打出',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————彭羕
                        QD_pengyang: '彭羕',
                        QD_xiaofan: '嚣翻',
                        QD_xiaofan_info: '你可以将牌堆底4张牌如手牌般使用/打出',
                        QD_duishi: '侻失',
                        QD_duishi_info: '你使用非手牌时,无距离次数限制,并弃置一名角色前X个区域中的所有牌:武将牌上/判定区/装备区/手牌区(X为本回合你使用过牌的类型数)',
                        QD_cunmu: '寸目',
                        QD_cunmu_info: '敌方角色不能使用【无懈可击】.敌方角色使用点数为字母的牌时,你令此牌无效并摸一张牌<br>敌方角色使用伤害牌累计未造成伤害三次后,你令其失效一个技能',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————卢植
                        QD_luzhi: '卢植',
                        QD_mingren: '明任',
                        QD_mingren_info: '每轮开始时,你摸两张牌,将一张牌称为<任>置于武将牌上',
                        QD_zhenliang: '贞良',
                        QD_zhenliang_info: '出牌阶段限一次,你可以弃置场上与你区域内任意张与<任>花色相同的牌,分配等量伤害<br>当任意牌被使用后,若此牌与<任>花色相同,你摸一张牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————沮授 监军谋国 2/3 3护甲
                        QD_jushoux: '沮授',
                        QD_shibei: '矢北',
                        QD_shibei_info: '当任意角色受到伤害后,若是其本回合首次受到伤害,你回复一点体力,否则你令一名其他角色失去一点体力',
                        QD_jianying: '渐营',
                        QD_jianying_info: '当任意牌被使用时,若此牌与上一张被使用的牌点数或花色相同,你摸一张牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————徐盛 江东的铁壁 4/4
                        QD_xusheng: '徐盛',
                        QD_pojun: '破军',
                        QD_pojun_info: '当任意其他角色成为【杀】的目标后,你可以获得其至多体力值张牌<br>若你的装备区里没有武器牌时,你视为装备【古锭刀】',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————曹操
                        QD_caocao: '曹操',
                        QD_jianxiong: '奸雄',
                        QD_jianxiong_info: '任意角色受到伤害后,你获得造成伤害的牌并摸一张牌(以此法获得的牌,每回合限用一次,且不计入手牌上限)',
                        QD_hujia: '護駕',
                        QD_hujia_info: '当你需要使用或打出【闪】时,你可以令任意其他角色替你打出【闪】,没打出【闪】的角色受到一点伤害',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————张芝
                        QD_zhangzhi: '张芝',
                        QD_bixin: '笔心',
                        QD_bixin_info: '任意角色的准备阶段/结束阶段,你可以声明一种牌的类型,并选择一种基本牌.你摸3张牌,将当前回合角色所有此类型的牌当此基本牌使用',
                        QD_feibai: '飞白',
                        QD_feibai_info: '当你因执行非黑/红色牌的效果而造成伤害/回复时,此数值翻倍',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————孙皓
                        QD_sunhao: '孙皓',
                        QD_canshi: '残蚀',
                        QD_canshi_info: '已受伤角色回合开始时,你摸全场已受伤角色数的牌.其他未受伤角色失去牌时,随机弃置一张牌',
                        QD_chouhai: '仇海',
                        QD_chouhai_info: '当你<受到伤害/造成伤害>时,若对方手牌数不大于你,此伤害<-1/+1>',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————钟琰
                        QD_zhongyan: '钟琰',
                        QD_bolan: '博览',
                        QD_bolan_info: '任意回合开始时,你随机获得阴间技能池中一个技能(覆盖之前获得的)',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————吕蒙
                        QD_lvmeng: '吕蒙',
                        QD_keji: '克己',
                        QD_keji_info: '任意角色弃牌阶段结束时,你摸其弃牌数两倍的牌',
                        QD_botu: '博圖',
                        QD_botu_info: '任意角色回合结束时,若此回合全场角色累计失去过的牌包含四种花色,你可以立即执行一个额外的回合',
                        QD_gongxin: '攻心',
                        QD_gongxin_info: '阶段限一次,当你<使用牌指定其他角色为目标/成为其他角色使用牌的目标>时,你观看对方牌并获得每种花色各一张',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————张让
                        QD_zhangrang: '张让',
                        QD_taoluan: '滔乱',
                        QD_taoluan_info: '每种牌名每阶段限一次,你可以将一张牌当任意牌使用或打出,你选择一名其他角色令其选择①交给你一张牌②失去一点体力并随机失效一个技能',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————荀攸
                        QD_xunyou: '荀攸',
                        QD_qice: '奇策',
                        QD_qice_info: '你可将所有黑色手牌当作任意一张普通锦囊牌使用,并摸一张牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————夏侯渊
                        QD_xiahouyuan: '夏侯渊',
                        QD_shensu: '神速',
                        QD_shensu_info: '你的阶段开始时,可以跳过之,并令一名其他角色跳过其下个相同的阶段',
                        QD_shebian: '设变',
                        QD_shebian_info: '当场上有人跳过阶段时,若此阶段为①摸牌阶段,你获得其他角色的至多两张牌②出牌阶段,你移动场上的一张牌<br>你可以视为对一名其他角色使用一张杀',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————曹仁
                        QD_caoren: '曹仁',
                        QD_jushou: '据守',
                        QD_jushou_info: '任意角色结束阶段,你可以摸四张牌,使用一张牌,令其翻面',
                        QD_jiewei: '解围',
                        QD_jiewei_info: '你可以将场上的牌当无懈可击使用',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————曹植
                        QD_caozhi: '曹植',
                        QD_luoying: '落英',
                        QD_luoying_info: '任意角色<不因使用而>失去♣️️牌时,你获得之翻回正面.你的出牌阶段外,删除此技能括号内内容',
                        QD_jiushi: '酒诗',
                        QD_jiushi_info: '你可以将一名正面朝上角色的武将牌翻面,视为使用一张酒',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————曹真
                        QD_caozhen: '曹真',
                        QD_sidi: '司敌',
                        QD_sidi_info: '任意角色出牌阶段开始时,你可以将其一张牌当做<杀>对其使用,令其本回合不可使用或打出与此牌颜色相同的牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————钟繇
                        QD_zhongyao: '钟繇',
                        QD_huomo: '活墨',
                        QD_huomo_info: '你可以将当前回合角色区域内一张牌置于牌堆顶,视为使用一张本回合未以此法使用过的基本牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————蛊惑
                        QD_蛊惑: '蛊惑',
                        蛊惑: '蛊惑',
                        蛊惑_info: '回合限一次,你可以将牌堆底一张牌扣置当任意一张基本牌或普通锦囊牌使用或打出.其他所有角色依次选择是否质疑,有人质疑则翻开此牌:若此牌与你声明的牌相同,质疑者获得一个<惑>标记;反之则此牌作废,你本回合对质疑者使用牌无距离次数限制,每有一个质疑者,你增加一次蛊惑次数;拥有<惑>标记的角色不可质疑你的蛊惑.每回合结束时你可以移除惑标记,视为使用移除的标记数张任意牌',
                        煽火: '煽火',
                        煽火_info: '每轮限一次,任意角色受到伤害后,你可以发起一次议事,若结果为红色,伤害来源需交给受伤者X张牌(X为受伤者已损失的体力值)并失去一点体力;若结果为黑色,伤害来源需选择一项:1.不能使用或打出手牌直到本轮结束:2.将武将牌翻至背面:若受伤者为你,则你发动此技能无次数限制.当场上有<惑>的角色数不小于未拥有<惑>角色时,你[议事/拼点!时「拥有<惑>的角色的意见视为与你相同/此牌点数+31',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————董卓
                        QD_董卓: '董卓',
                        QD_暴虐: '暴虐',
                        QD_暴虐_info: '任意角色体力变化后,你进行判定,若为♠️️,你回复1点体力并获得判定牌',
                        QD_roulin: '肉林',
                        QD_roulin_info: '任意角色不因重铸或使用而失去♠️️牌时,你获得之',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————神赵云
                        QD_神赵云: '神赵云',
                        冲阵: '冲阵',
                        冲阵_info: '你可将牌按如下<♥️️️桃/♦️️火杀/♣️️闪/♠️️牌无懈/🃏诸葛>花色对应关系使用或打出并获得随机对方一张牌',
                        绝境: '绝境',
                        绝境_info: '你的手牌上限+5;当你进入或脱离濒死状态时,你摸2张牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————冯方女
                        QD_冯方女: '冯方女',
                        妆梳: '妆梳',
                        妆梳_info: '任意角色的回合开始时,你可以弃置一张牌,将一张<宝梳>置入其宝物区(牌的类别决定<宝梳>种类)',
                        垂涕: '垂涕',
                        垂涕_info: '任意牌不因使用而失去后,你可以使用之',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————曹宪曹华
                        QD_曹宪曹华: '曹宪曹华',
                        鸣: '鸣',
                        鸣_info: '出牌阶段你可随机弃置六张牌,并随机从牌堆中获得三张锦囊牌',
                        化木: '化木',
                        化木_info: '当你使用手牌后,你将此牌置于你的武将牌上,黑色牌称为<灵杉>,红色牌称为<玉树>',
                        良缘: '良缘',
                        良缘_info: '你可以将场上一张<灵杉>/<玉树>当<酒>/<桃>使用',
                        前盟: '前盟',
                        前盟_info: '当<灵杉>或<玉树>数量变化后,你摸一张牌',
                        羁肆: '羁肆',
                        羁肆_info: '限定技,准备阶段,你可以令一名其他角色获得前盟',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————李典
                        QD_李典: '李典',
                        恂恂: '恂恂',
                        恂恂_info: '体力变化/每轮开始时,你观看牌堆顶五张牌获得其中两张,其余牌置入牌堆底',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————杨艳
                        QD_杨艳: '杨艳',
                        娴婉: '娴婉',
                        娴婉_info: '你可以横置一名角色,视为使用一张基本牌.你可以重置一名角色,视为使用一张锦囊牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————神司马
                        QD_神司马: '神司马',
                        忍戒: '忍戒',
                        忍戒_info: '当你改变体力值或出牌阶段外失去牌时,你获得等量的忍.当你的忍大于3,你获得<极略>,增加一点体力上限,回复两点体力,摸两张牌',
                        极略: '极略',
                        极略_info: '任意角色的判定牌生效前,你可以弃1枚<忍>标记并发动〖鬼才〗<br>每当你受到伤害后,你可以弃1枚<忍>标记并发动〖放逐〗<br>出牌阶段,你可以弃1枚<忍>标记并发动〖制衡〗<br>出牌阶段,你可以弃1枚<忍>标记并获得〖完杀〗直到回合结束',
                        极略_zhiheng: '制衡',
                        极略_zhiheng_info: '你可以弃置一个忍发动一次制衡,无次数限制',
                        极略_wansha: '完杀',
                        极略_wansha_info: '完杀',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————黄盖
                        QD_黄盖: '黄盖',
                        QD_黄盖0: '黄盖0',
                        QD_黄盖1: '黄盖1',
                        QD_kuroux: '苦肉',
                        QD_kuroux_info: '出牌阶段你可以失去一点体力增加一个回合',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————神吕蒙
                        QD_神吕蒙: '神吕蒙',
                        涉猎: '涉猎',
                        涉猎_info: '摸牌阶段,你改为获得牌堆中每种花色的牌各一张',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————钟会
                        QD_钟会: '钟会',
                        权计: '权计',
                        权计_info: '①体力变化/出牌阶段内不因使用而失去牌/出牌阶段外失去牌时,你摸一张牌,将一张牌称为<权>置于武将牌上②你的手牌上限+X(X为<权>数)',
                        排异: '排异',
                        排异_info: '转换技,你可移去一张<权>并①摸X张牌②对敌方角色各造成1点伤害(X为<权>数)',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————严颜
                        QD_严颜: '严颜',
                        拒战: '拒战',
                        拒战_info: '当你成为其他角色牌的目标后,你与其各摸一张牌,其本回合内不能再对你使用牌.当你使用牌指定任意角色为目标后,你获得其一张牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————司马师
                        QD_司马师: '司马师',
                        夷灭: '夷灭',
                        夷灭_info: '当你对其他角色造成伤害时,你将伤害值改为其体力上限',
                        泰然: '泰然',
                        泰然_info: '回合<开始/结束>时,你将体力与手牌调整至体力上限',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————徐荣
                        QD_徐荣: '徐荣',
                        QD_xionghuo: '凶镬',
                        QD_xionghuo_info: '游戏开始时,你获得游戏人数个<暴戾>,你对有<暴戾>的其他角色造成的伤害+x<br>任意角色濒死时,你获得<暴戾><br>出牌阶段,你可以分配<暴戾><br>你的手牌上限加全场<暴戾>数<br>有<暴戾>的其他角色的出牌阶段开始时,其随机执行x次以下项<br>①火伤且本回合不能对你使用牌<br>②体流且永久扣减手牌上限<br>③令你获得其每个区域随机牌(x为其<暴戾>数)',
                        QD_xionghuo_4: '凶镬',
                        QD_xionghuo_4_info: '不能对凶镬对象使用牌',
                        QD_xionghuo_5: '凶镬',
                        QD_xionghuo_5_info: '永久扣减手牌上限',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————族吴苋
                        QD_族吴苋: '族吴苋',
                        贵相: '贵相',
                        贵相_info: '你的回合改为六个出牌阶段',
                        移荣: '移荣',
                        移荣_info: '出牌阶段限一次,你可令手牌上限加一,将手牌摸到手牌上限',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————神吕布
                        QD_神吕布: '神吕布',
                        QD_baonu: '暴怒',
                        QD_baonu_info: '你登场时获得游戏人数个<暴怒>,每轮开始/受到伤害/造成伤害后,你从修罗兵器里面随机装备一个并获得等量<暴怒>',
                        QD_baonu_append: '修罗兵器:无双方天戟/修罗炼狱戟/玲珑狮蛮带/烈焰赤兔马/束发紫金冠',
                        QD_shenfen: '神愤',
                        QD_shenfen_info: '回合限一次,你可以弃置其他角色数枚<暴怒>,对所有其他角色造成一点伤害,令其翻面并弃置所有牌',
                        神威: '神威',
                        神威_info: '摸牌阶段,你额外摸X张牌,你的手牌上限+X(X为场上人数)',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————沮授
                        QD_沮授: '沮授',
                        矢北: '矢北',
                        矢北_info: '每轮你首次受到伤害后回复13点体力,每回合受到的伤害改为x(x为本回合受伤次数)',
                        渐营: '渐营',
                        渐营_info: '记录你每轮使用的第一张牌的点数(不覆盖上次记录),当你使用或打出与记录点数相同的牌时,你摸一张牌',
                        释怀: '释怀',
                        释怀_info: '你获得所有装备过的装备牌对应的技能',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————兀突骨
                        QD_兀突骨: '兀突骨',
                        QD_ranshang: '燃殤',
                        QD_ranshang_info: '当你受到火属性伤害时,伤害翻倍且获得等同于伤害数量<燃>.你的结束阶段受到<燃>标记数点火属性伤害.多目标牌和普通杀对你无效,当游戏轮数大于10时,你所在阵营获胜',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————贾诩
                        QD_贾诩: '贾诩',
                        QD_luanwu: '乱武',
                        QD_luanwu_info: '回合限一次,你可令所有角色依次选择视为使用一张无距离限制的杀或者伤害锦囊,若存在其他角色在<乱武>之后体力值未减少,则再发动一次<乱武>',
                        QD_weimu: '帷幕',
                        QD_weimu_info: '由你自己作为来源或回合内体力值与体力上限变化后,你摸变化值两倍的牌,免疫之.你不能成为黑色牌的目标',
                        QD_wansha: '完杀',
                        QD_wansha_info: '任意角色体力值每累计变化两次后,你视为对其使用一张杀.你对体力值不大于你的角色造成的伤害翻倍',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————王异
                        QD_王异: '王异',
                        贞烈: '贞烈',
                        贞烈_info: '当你成为负收益的牌的目标时,你失去一点体力,并可以选择获得场上角色至多x张手牌,若你获得的牌不足x张则摸不足的牌数,x为你已损体力值',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————蔡文姬
                        QD_wenji: '蔡文姬',
                        QD_shuangjia: '霜笳',
                        QD_shuangjia_info: '①游戏开始,你将牌堆顶四张牌标记为<霜笳>②其他角色至你的距离+<霜笳>数③当你失去牌后,若这些牌中有<霜笳>牌,你获得与此牌花色均不同牌各一张②你使用牌无距离和次数限制③每回合开始时,你获得所有<霜笳>牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————董白
                        QD_董白: '董白',
                        连诛: '连诛',
                        连诛_info: '每轮开始/受到伤害后,你可将一张牌交给一名其他角色并获得如下效果:摸牌阶段的额定摸牌数+1,使用【杀】的次数上限+1,手牌上限+1',
                        黠慧: '黠慧',
                        黠慧_info: '你的黑色牌不计入手牌上限;其他角色获得你的黑色牌时,其不能使用、打出、弃置这些牌',
                        黠慧_2: '黠慧',
                        黠慧_2_info: '不能使用、打出或弃置获得的黑色牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————诸葛亮
                        QD_诸葛亮: '诸葛亮',
                        QD_guanxing: '观星',
                        QD_guanxing_info: '每回合开始时,观看牌堆顶七张牌,并任意将这些牌置于牌堆顶或牌堆底',
                        QD_guanxing1: '观星',
                        QD_guanxing1_info: '准备阶段开始时,观看牌堆顶七张牌,并任意将这些牌置于牌堆顶或牌堆底',
                        QD_kongcheng: '空城',
                        QD_kongcheng_info: '①若你手牌只有一种类型,你不能成为伤害牌的目标②回合结束时,若你手牌只有一种类型,则取消①中的条件直至你回合开始',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————橘子
                        QD_橘子: '橘子',
                        给橘: '给橘',
                        给橘_info: '出牌阶段开始时,你可以失去1点体力或移去1个<橘>,令一名其他角色获得2个<橘>',
                        橘: '橘',
                        橘_info: '游戏开始时,你获得6个<橘>;有<橘>的角色摸牌阶段多摸2张牌;摸牌阶段开始前,你获得2个<橘>.当有<橘>的角色受到伤害时,防止此伤害,其移去1个<橘>',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————张角
                        QD_张角: '张角',
                        QD_leiji: '雷击',
                        QD_leiji_info: '任意角色回合外使用或打出牌时,你进行一次判定<br>任意角色判定结束后,若结果为:♠️️️,你分配2点雷电伤害;♣️️️,你回复1点体力并分配1点雷电伤害',
                        鬼道: '鬼道',
                        鬼道_info: '任意角色的判定牌生效前,你摸一张牌,可以打出一张牌替换之',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————袁术
                        QD_袁术: '袁术',
                        QD_wangzun: '妄尊',
                        QD_wangzun_info: '其他角色准备阶段你可以摸一张牌,其本回合只能对你使用牌,且手牌上限减三',
                        QD_wangzun_1: '被妄尊',
                        QD_wangzun_1_info: '本回合只能对妄尊技能持有者使用牌,且手牌上限减三',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————曹仁
                        QD_曹仁: '曹仁',
                        据守: '据守',
                        据守_info: '弃牌阶段开始时,你翻面并弃置所有手牌;当你翻面时,摸等同于<护甲>值的牌;当你<出牌阶段外失去牌/出牌阶段内不因使用而失去牌>时,获得等量的<护甲>',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————薛综
                        QD_薛综: '薛综',
                        安国: '安国',
                        安国_info: '出牌阶段限2次,你可以选择一名其他角色,你与其各摸一张牌,回复1点体力,随机使用一张装备牌',
                        复难: '复难',
                        复难_info: '其他角色使用或打出牌响应你使用的牌时,你可获得其使用或打出的牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————曹昂
                        QD_曹昂: '曹昂',
                        慷忾: '慷忾',
                        慷忾_info: '任意角色成为牌的目标时(使用者不能是其自身),你可以摸两张牌并交给其一张牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————法正
                        QD_法正: '法正',
                        恩怨: '恩怨',
                        恩怨_info: '体力变化/每轮开始时,你可以获得一名其他角色一张牌并令其失去一点体力,你摸一张牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————张辽
                        QD_张辽: '张辽',
                        突袭: '突袭',
                        突袭_info: '当你摸牌时,你可以少摸任意张牌,并获得其他角色等量张牌',
                        镇卫: '镇卫',
                        镇卫_info: '当其他角色成为单一目标牌的目标时(使用者不能是其自身和你),你可以将目标转移给你并摸一张牌,也可以将此牌置于使用者武将牌上,此牌失效,使用者回合结束后获得此牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————孙登
                        QD_孙登: '孙登',
                        诓人: '诓人',
                        诓人_info: '出牌阶段你可选择一名其他角色将其所有牌放于你武将牌上,你与其在你下个准备阶段摸武将牌上数量的牌,并移去武将牌上的牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————藤芳兰
                        QD_藤芳兰: '藤芳兰',
                        落宠: '落宠',
                        落宠_info: '体力变化/每轮开始时,你可以令一名角色:回复一点体力、弃置两张牌、摸两张牌、失去一点体力',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————制衡
                        QD_制衡: '制衡',
                        制衡: '制衡',
                        制衡_info: '体力变化/每轮开始时,你可以发动制衡或增加出牌阶段内发动制衡的次数',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————大乔
                        QD_大乔: '大乔',
                        国色: '国色',
                        国色_info: '出牌阶段,你可弃置一张♦️️牌赋予一名其他角色不动白标记并摸一张牌',
                        不动白: '不动白',
                        不动白_info: '你跳过出牌阶段',
                        流离: '流离',
                        流离_info: '当你成为其他角色牌的目标时,你可以弃置一张牌将此牌转移给其他角色',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————徐晃
                        QD_徐晃: '徐晃',
                        断粮: '断粮',
                        断粮_info: '出牌阶段,你可弃置一张黑色牌并赋予一名其他角色摸牌白标记',
                        摸牌白: '摸牌白',
                        摸牌白_info: '你跳过摸牌阶段',
                        截辎: '截辎',
                        截辎_info: '当有人跳过摸牌阶段后,你摸两张牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————神周瑜
                        QD_神周瑜: '神周瑜',
                        琴音: '琴音',
                        琴音_info: '回合结束时,你令所有友方角色回复一点体力,令所有敌方角色失去一点体力',
                        业炎: '业炎',
                        业炎_info: '出牌阶段,你可以分配3点火焰伤害给任意角色',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————夏侯渊
                        QD_夏侯渊: '夏侯渊',
                        奇兵: '奇兵',
                        奇兵_info: '任意角色的结束阶段结束时,你摸一张牌,可以使用一张牌,此牌无距离限制',
                        夺锐属性: '夺锐属性',
                        夺锐属性_info: '当你每回合第一次使用牌指定其他角色为目标时,你随机夺取他的一个属性(体力上限、摸牌阶段摸牌数、攻击范围、出牌阶段使用杀的次数、手牌上限)',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————阎圃
                        QD_阎圃: '阎圃',
                        缓图: '缓图',
                        缓图_info: '任意角色摸牌阶段开始时,你可以令其摸两张牌并跳过此摸牌阶段',
                        缓图_1: '缓图1',
                        缓图_1_info: '任意角色出牌阶段开始时,你可以令其视为使用一张杀并跳过此出牌阶段',
                        缓图_2: '缓图2',
                        缓图_2_info: '任意角色弃牌阶段开始时,你可以令其弃置两张牌并跳过此弃牌阶段',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————左慈
                        QD_左慈: '左慈',
                        QD_huanshen: '幻身',
                        QD_huanshen_info: '①游戏开始时,你随机获得两张未加入游戏的武将牌(称为<幻身>),第一个<幻身>固定为孙策.回合开始与结束时,你弃置任意张<幻身>并获得双倍<幻身>,每弃置一张<幻身>,增加一点体力上限和3点护甲,并获得一张<幻身>上的所有技能.你每次受到和造成伤害时,获得伤害值2倍的<幻身>',
                        QD_xianshu: '仙术',
                        QD_xianshu_info: '当你进入濒死时,随机使用牌堆中和场上的<桃>与<酒>',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————杨婉
                        QD_杨婉: '杨婉',
                        诱言: '诱言',
                        诱言_info: '阶段限一次,当你失去牌时,你获得和失去牌花色不同的牌各一张',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————杨芷
                        QD_杨芷: '杨芷',
                        QD_wanyi: '婉嫕',
                        QD_wanyi_info: '①当你使用牌指定目标后,你将目标的一张牌置于你的武将牌上作为<嫕>.②与<嫕>花色相同的牌不占用你手牌上限且无距离次数限制.③每回合结束/体力变化后,你获得一张<嫕>',
                        埋祸: '埋祸',
                        埋祸_info: '其他角色对你使用牌时,你可以将此牌置于其武将牌上称为<祸>并令其失效<br>当你对其他角色使用牌时,移去其武将牌上的一张<祸><br>其他角色出牌阶段开始时,随机失去一半的<祸>(向上取整),对你使用剩余的<祸>',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————宣公主
                        QD_宣公主: '宣公主',
                        比翼: '比翼',
                        比翼_info: '游戏开始时你令友方角色获得<比翼>标记,你们共享且平分体力值<br>任意<比翼>角色体力变化后,所有<比翼>角色摸其体力变化张牌<br>任意<比翼>角色使用牌后,其他<比翼>角色可以弃置一张牌,令此牌额外结算一次',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————东风诸葛
                        QD_zhuge: '东风诸葛',
                        QD_jinfa: '禁法',
                        QD_jinfa_info: '转换技,你可以终止其他角色一个<触发技/主动技>的发动',
                        QD_dongfeng: '东风',
                        QD_dongfeng_info: '游戏开始时,你将所有七点数牌当作<东风>置于武将牌上.每轮开始时,你将牌堆顶一张牌置入<东风>,你任意交换手牌与<东风>,你选择任意名角色,赋予其<大雾>或<狂风>标记,并弃置等量的<东风>',
                        QD_dongfeng_append: '<大雾>当你受到伤害时,若其的属性与随机一种属性不相同,则你防止之<br><狂风>你受到的属性伤害翻倍',
                        QD_dawu: '大雾',
                        QD_dawu_info: '当你受到伤害时,若其的属性与随机一种属性不相同,则你防止之',
                        QD_kuangfeng: '狂风',
                        QD_kuangfeng_info: '你受到的属性伤害翻倍',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————神陆逊
                        QD_shenluxun: '神陆逊',
                        QD_junlve: '军略',
                        QD_junlve_info: '当你受到或造成伤害后,你获得X个<军略>标记(X为伤害点数)',
                        QD_cuike: '摧克',
                        QD_cuike_info: '出牌阶段开始时,若<军略>标记的数量为奇数,你可以对一名其他角色造成军略数点伤害;若<军略>标记的数量为偶数,你可以横置一名其他角色并弃置其区域内的军略数张牌.若<军略>标记的数量超过7个,你可以移去全部<军略>标记并对所有其他角色造成军略数点伤害.',
                        QD_dinghuo: '绽火',
                        QD_dinghuo_info: '出牌阶段限一次,你可以令至多军略数的已横置角色弃置所有装备区内的牌.你对其中一名其他角色造成军略数点火焰伤害',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————春哥
                        QD_chunge: '春哥',
                        QD_jueqing: '绝情',
                        QD_jueqing_info: '当你<造成/受到>伤害时,你可以弃置任意张牌,此伤害改为体力流失.若弃置牌数大于对方体力值,此伤害<+1/-1>.当任意角色进入濒死状态时,若无伤害来源,你增加一点体力上限',
                        QD_shangshi: '伤逝',
                        QD_shangshi_info: '你手牌数始终不小于已损体力值(至少为1),你以此法获得的牌不可被响应且无次数距离限制',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————孙笨
                        QD_孙笨: '孙笨',
                        QD_yingzi: '英姿',
                        QD_yingzi_info: '你的手牌上限+x,摸牌阶段你多摸x张牌,x为你的体力上限',
                        QD_jiang: '激昂',
                        QD_jiang_info: '当你使用红色基本牌或成为牌的唯一目标后,你摸一张牌,当你于因此摸牌数首次达到X张牌后,将记录值清零,你增加一点体力上限,选择一项:①回满体力;②摸X张牌;③获得<英魂>;④获得<英姿>.x为你的体力上限',
                        QD_yinghun: '英魂',
                        QD_yinghun_info: '每轮开始时,你可以弃置一名其他角色至多X张牌,令一名角色摸剩余数量张牌,x为你的体力上限',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————————邓艾
                        QD_dengai: '邓艾',
                        QD_tuntian: '屯田',
                        QD_tuntian_info: '<出牌阶段外失去牌/出牌阶段内不因使用而失去牌>后,你可以获得其他角色的y张牌(y不大于2x),摸2x-y张牌(x为你失去牌的数量)',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————陆逊
                        QD_luxun: '陆逊',
                        QD_qianxun: '谦逊',
                        QD_qianxun_info: '当一张锦囊牌被使用时,你可以将任意名角色至多X张牌当作<谦逊>牌置于你的武将牌上.每回合结束时,你可以选择获得任意张<谦逊>牌(X为你<谦逊>牌数且至少为一)',
                        QD_lianying: '连营',
                        QD_lianying_info: '每当一个区域内失去最后一张牌时,你摸X张牌.当你一次性获得至少两张牌时,你可以分配其中的红色牌数点火焰伤害',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————周泰
                        QD_zhoutai: '周泰',
                        QD_buqu: '不屈',
                        QD_buqu_info: '当你进入濒死状态时,你可以令一名角色展示牌堆顶一张牌,若此牌与其武将牌上的不屈牌点数均不同,你将此牌置于其武将牌上,将体力回复至1.否则你获得所有不屈牌,其执行一次濒死结算.若其因此死亡,则终止你的濒死结算.你的手牌上限+全场不屈牌的数量',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————陆抗
                        QD_lukang: '陆抗',
                        QD_qianjie: '谦节',
                        QD_qianjie_info: '你不能被横置与翻面,不能成为延时锦囊牌或其他角色拼点的目标,你可以重铸装备牌',
                        QD_jueyan: '决堰',
                        QD_jueyan_info: '每轮开始时,你可以废除一名角色的装备区',
                        QD_poshi: '破势',
                        QD_poshi_info: '任意角色回合开始时,若其存在废除的装备栏,你按被废除的区域执行:武器栏,你使用【杀】的次数上限永久+3;防具栏,你摸三张牌且手牌上限永久+3;坐骑栏,你使用牌无距离限制直到你的回合结束;宝物栏,你获得技能<集智>直到你的回合结束',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————朱桓
                        QD_zhuhuan: '朱桓',
                        QD_fenli: '奋励',
                        QD_fenli_info: '任意角色回合开始时,若其的(手牌数/体力值/装备区里的牌数)为全场最大或最小,你可以令其跳过(摸牌阶段/出牌阶段/弃牌阶段)',
                        QD_pingkou: '平寇',
                        QD_pingkou_info: '任意角色回合结束时,你可以分配至多X点伤害(X为其本回合跳过的阶段数)',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————孙权
                        QD_sunquan: '孙权',
                        QD_zhiheng: '制衡',
                        QD_zhiheng_info: '回合限一次,你可以弃置一名角色任意张牌,摸等量的牌(若弃置了一个区域内的所有牌,则多摸一张牌)',
                        QD_jiuyuan: '救援',
                        QD_jiuyuan_info: '当其他角色使用【桃】时,你可以令此牌目标改为你,你摸一张牌<br>其他角色对你使用的【桃】回复的体力值+1<br>当你需要使用【桃】时,你可以令任意其他角色代替你使用一张【桃】,否则该角色失去一点体力<br>若此时为你的出牌阶段,此技能本阶段失效',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————黄盖
                        QD_huanggai: '黄盖',
                        QD_kurou: '苦肉',
                        QD_kurou_info: '回合每名角色限一次,你可以弃置其一张牌令其失去1点体力',
                        QD_zhaxiang: '诈降',
                        QD_zhaxiang_info: '任意角色失去1点体力后,你摸x张牌,增加1点护甲,使用【杀】的次数永久+1,本阶段使用【杀】无距离限制且不能被响应(X为<詐降>发动次数)',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————周瑜
                        QD_zhouyu: '周瑜',
                        QD_yingzix: '英姿',
                        QD_yingzix_info: '你不因此技能获得牌时摸一张牌,每轮开始时,你可以令一名其他角色于本轮获得牌时随机少获得一张牌',
                        QD_yingzix_2: '英姿',
                        QD_yingzix_2_info: '获得牌时随机少获得一张牌',
                        QD_fanjian: '反间',
                        QD_fanjian_info: '回合每种花色限一次,你可以声明一个花色获得一名其他角色一张牌.若此牌花色与你声明的花色不同,其弃置与此牌花色相同的牌.若其因此弃置了牌,其失去1点体力',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————华佗
                        QD_huatuo: '华佗',
                        QD_jijiu: '急救',
                        QD_jijiu_info: '你可以将场上或你区域内红色牌当张【桃】、黑色牌当【酒】对一名角色使用',
                        QD_qingnang: '青囊',
                        QD_qingnang_info: '回合每名角色限一次,你可以弃置其一张牌并令其失去或回复一点体力',
                        QD_chuli: '除癀',
                        QD_chuli_info: '每轮开始时,你可以弃置任意名角色各一张牌.任意角色弃置非红色牌后,你可以令其摸或弃一张牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————黄月英
                        QD_huangyueying: '黄月英',
                        QD_jizhi: '集智',
                        QD_jizhi_info: '每种牌名每阶段限一次,你可以将两张花色相同的非锦囊牌当任意普通锦囊牌使用;任意角色使用锦囊牌时,你摸一张牌,手牌上限+1',
                        QD_qicai: '奇才',
                        QD_qicai_info: '你使用锦囊牌无距离限制,你装备区内的牌不能因替换装备外失去',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————甄姬
                        QD_zhenji: '甄姬',
                        QD_luoshen: '洛神',
                        QD_luoshen_info: '任意角色准备阶段,你进行一次判定并获得此牌,若结果不为红色,你重复此流程.你的黑色牌不计入手牌上限和使用次数',
                        QD_qingguo: '傾國',
                        QD_qingguo_info: '你可以将一张黑色牌当做【闪】使用或打出.当你需要使用或打出闪时,其他所有角色选择是否交给你一张黑色牌,你可以令没交给你牌的角色受到一点冰冻伤害或翻面',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————大乔
                        QD_daqiao: '大乔',
                        QD_guose: '國色',
                        QD_guose_info: '回合每名角色限一次,你可以观看并弃置其区域内的一张◆牌,你选择一项:1.视为对一名其他角色使用一张【乐不思蜀】;2.移动或弃置场上一张【乐不思蜀】.若如此做,你摸一张牌',
                        QD_liuli: '流離',
                        QD_liuli_info: '当你成为其他角色使用伤害牌的目标时,你可以弃置其一张牌,将此牌转移给一名其他角色',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————貂蝉
                        QD_diaochan: '貂蝉',
                        QD_lijian: '离间',
                        QD_lijian_info: '回合每名角色限一次,你可以弃置其一张牌,选择一名其他角色,令后者视为对前者使用一张【决斗】',
                        QD_biyue: '闭月',
                        QD_biyue_info: '任意角色结束阶段,你摸两张牌',
                        //——————————————————————————————————————————————————————————————————————————————————————————————————孙尚香
                        QD_sunshangxiang: '孙尚香',
                        QD_jieyin: '結姻',
                        QD_jieyin_info: '回合每名角色限一次,你可以选择一名其他角色,你弃置其一张手牌或将其一张装备牌置入你的装备区.若如此做,你摸一张牌并回复1点体力',
                        QD_xiaoji: '枭姬',
                        QD_xiaoji_info: '任意角色失去装备牌后,你摸两张牌',
                    },
                };
                for (const i in QQQ.character) {
                    const info = QQQ.character[i];
                    if (!info.hp) {
                        info.hp = 4;
                    }
                    if (!info.maxHp) {
                        info.maxHp = 4;
                    }
                    info.group = '德';
                    info.isZhugong = true;
                    if (!info.trashBin) {
                        info.trashBin = [`ext:缺德扩展/image/${i}.jpg`];
                    }
                    info.dieAudios = [`ext:缺德扩展/audio/${i}.mp3`];
                    if (QQQ.translate[i]) {
                        QQQ.translate[i] = `缺德·${QQQ.translate[i]}`;
                    }
                }
                for (const i in QQQ.skill) {
                    const info = QQQ.skill[i];
                    info.nobracket = true;
                    if (QQQ.translate[i]) {
                        QQQ.translate[i] = `缺德·${QQQ.translate[i]}`;
                    }
                    const trans = QQQ.translate[`${i}_info`];
                    if (info.forced && trans) {
                        QQQ.translate[`${i}_info`] = `<span class=Qmenu>锁定技,</span>${trans}`;
                    }
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
                lib.translate.缺德扩展_character_config = `缺德扩展`;
                lib.config.all.characters.add('缺德扩展');
                lib.config.characters.add('缺德扩展');
                return QQQ;
            }); //联机
            game.import('card', function (lib, game, ui, get, ai, _status) {
                const QQQ = {
                    name: '缺德扩展',
                    connect: true,
                    card: {
                        QD_chitu: {
                            fullskin: true,
                            type: 'equip',
                            subtype: 'equip4',
                            distance: {
                                globalFrom: -2,
                                globalTo: 1,
                            },
                            skills: ['QD_chitu'],
                            ai: {
                                equipValue: 60,
                            },
                        },
                        无双方天戟: {
                            type: 'equip',
                            subtype: 'equip1',
                            skills: ['无双方天戟'],
                            distance: {
                                attackFrom: -2,
                            },
                            ai: {
                                equipValue: 85,
                            },
                        },
                        修罗炼狱戟: {
                            type: 'equip',
                            subtype: 'equip1',
                            skills: ['修罗炼狱戟'],
                            distance: {
                                attackFrom: -3,
                            },
                            ai: {
                                equipValue: 70,
                            },
                        },
                        玲珑: {
                            type: 'equip',
                            subtype: 'equip2',
                            ai: {
                                equipValue: 80,
                            },
                            skills: ['玲珑'],
                        },
                        犀梳: {
                            fullskin: true,
                            type: 'equip',
                            subtype: 'equip5',
                            skills: ['犀梳'],
                            ai: {
                                equipValue: 80,
                            },
                        },
                        琼梳: {
                            fullskin: true,
                            type: 'equip',
                            subtype: 'equip5',
                            skills: ['琼梳'],
                            ai: {
                                equipValue: 70,
                            },
                        },
                        金梳: {
                            fullskin: true,
                            type: 'equip',
                            subtype: 'equip5',
                            skills: ['金梳'],
                            ai: {
                                equipValue: 70,
                            },
                        },
                    },
                    translate: {
                        修罗炼狱戟: '修罗炼狱戟',
                        修罗炼狱戟_info: '你使用的正收益牌指定所有友方角色为目标,负收益牌指定所有敌方角色为目标;你造成伤害前令伤害增加x/3,造成伤害后令目标回复y/4点体力,x为目标体力值与体力上限中的最大值,y为最小值',
                        无双方天戟: '无双方天戟',
                        无双方天戟_info: '当你使用牌指定目标后,你选择一项:摸一张牌/弃置其一张牌',
                        玲珑: '玲珑',
                        玲珑_info: '负收益的牌指定你为目标时,你进行一次判定,若结果是红色,则此牌对你无效',
                        QD_chitu: '烈焰赤兔',
                        QD_chitu_info: '你计算与其他角色的距离-2,其他角色计算与你的距离+1<br>当你使用/被使用【决斗】/【杀】时,摸一张牌',
                        琼梳: '琼梳',
                        琼梳_info: '当你受到伤害时,你弃置X张牌并防止此伤害(X为伤害值)',
                        金梳: '金梳',
                        金梳_info: '回合结束时,你将手牌摸至体力上限',
                        犀梳: '犀梳',
                        犀梳_info: '跳过判定和弃牌阶段',
                    },
                };
                for (const i in QQQ.card) {
                    const info = QQQ.card[i];
                    if (!info.audio) {
                        info.audio = 'ext:缺德扩展/audio:2';
                    }
                    info.modTarget = true;
                    info.equipDelay = false;
                    info.loseDelay = false;
                    if (info.enable == undefined) {
                        info.enable = true;
                    }
                    if (info.type == 'equip') {
                        info.toself = true;
                        info.filterTarget = function (card, player, target) {
                            return player == target && target.canEquip(card, true);
                        };
                        info.selectTarget = -1;
                        info.ai.basic = {
                            equipValue: info.ai.equipValue,
                            useful: 0.1,
                            value: info.ai.equipValue,
                            order: info.ai.equipValue,
                        };
                        info.content = async function (event, trigger, player) {
                            if (event.cards.length) {
                                event.target.equip(event.cards[0]);
                            }
                        };
                        info.ai.result = {
                            target: (player, target, card) => get.equipResult(player, target, card),
                        };
                    }
                    if (!info.image) {
                        if (info.fullskin) {
                            info.image = `ext:缺德扩展/image/${i}.png`;
                        } else {
                            info.image = `ext:缺德扩展/image/${i}.jpg`;
                        }
                    }
                    lib.inpile.add(i);
                    if (info.mode && !info.mode.includes(lib.config.mode)) {
                        continue;
                    }
                    let num = Math.ceil(Math.random() * 5);
                    while (num-- > 0) {
                        lib.card.list.push([lib.suits.randomGet(), lib.number.randomGet(), i]);
                    }
                }
                lib.config.all.cards.add('缺德扩展');
                lib.config.cards.add('缺德扩展');
                lib.translate.缺德扩展_card_config = '缺德扩展';
                return QQQ;
            });
        },
        config: {
            群聊: {
                name: '<a href="https://qm.qq.com/q/SsTlU9gc24"><span class=Qmenu>【缺德扩展】群聊: 771901025</span></a>',
                clear: true,
            },
            文字闪烁: {
                name: '<span class=Qmenu>文字闪烁</span>',
                intro: '开启后,部分文字会附加闪烁动画效果',
                init: true,
            },
        },
        package: extensionInfo,
    };
});
