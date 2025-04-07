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
            if (game.players.some((q) => q.name == 'HL_许劭')) return true;
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
game.import('extension', function () {
    return {
        name: '缺德扩展',
        content() { },
        precontent() {
            get.vcardInfo = function (card) { }; //卡牌storage里面存了DOM元素会循环引用导致不能JSON.stringify
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
                const player = this, info = get.info(card), event = _status.event;
                const evt = event.name.startsWith('chooseTo') ? event : event.getParent((q) => q.name.startsWith('chooseTo'));
                if (evt.filterCard2) {
                    return evt._backup.filterCard(card, player, evt);
                }//viewAs的技能会修改chooseToUse事件的filterCard
                else if (evt.filterCard && evt.filterCard != lib.filter.filterCard) {
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
            };//删除次数限制//filter决定有无次数距离限制//viewAs的技能会修改chooseToUse事件的filterCard
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
            game.center = function () {
                const list = [];
                game.countPlayer2(function (current) {
                    current.getHistory('lose', function (evt) {
                        if (evt.position == ui.discardPile) list.addArray(evt.cards);
                    });
                });
                game.getGlobalHistory('cardMove', function (evt) {
                    if (evt.name == 'cardsDiscard') list.addArray(evt.cards);
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
                var card = lib.card[card.name];
                if (!card) {
                    if (QQQ.config.报错) {
                        alert(card + card.name + '没有卡牌info');
                        throw new Error();
                    }
                    card = lib.card['sha'];
                }
                if (card.notarget || card.selectTarget == undefined) return false;
                if (Array.isArray(card.selectTarget)) {
                    if (card.selectTarget[0] < 0) return !card.toself;
                    return card.selectTarget[0] != 1 || card.selectTarget[1] != 1;
                } else {
                    if (card.selectTarget < 0) return !card.toself;
                    return card.selectTarget != 1;
                }
            }; //多目标牌检测
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
            game.addGroup('德', '<span style="color:rgb(230, 137, 51)">德</span>', '德', {
                color: 'rgb(230, 137, 51)',
            });
            const style = document.createElement('style');
            style.innerHTML = '@keyframes QQQ{';
            for (var i = 1; i <= 20; i++) {
                let rand1 = Math.floor(Math.random() * 255),
                    rand2 = Math.floor(Math.random() * 255),
                    rand3 = Math.floor(Math.random() * 255);
                style.innerHTML += i * 5 + `%{text-shadow: black 0 0 1px,rgba(${rand1}, ${rand2}, ${rand3}, 0.6) 0 0 2px,rgba(${rand1}, ${rand2}, ${rand3}, 0.6) 0 0 5px,rgba(${rand1}, ${rand2}, ${rand3}, 0.6) 0 0 10px,rgba(${rand1}, ${rand2}, ${rand3}, 0.6) 0 0 10px,rgba(${rand1}, ${rand2}, ${rand3}, 0.6) 0 0 20px,rgba(${rand1}, ${rand2}, ${rand3}, 0.6) 0 0 20px}`;
            }
            style.innerHTML += '}';
            document.head.appendChild(style);
            const characterTitle = {
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
            }; //武将绰号
            Object.assign(lib.characterTitle, characterTitle);
            const characterIntro = {
                QD_chunge: '设计者:裸睡天依(2847826324)<br>编写者:潜在水里的火(1476811518)',
                QD_蛊惑: '设计者:瘟疫公司扩展作者(2224219574)<br>编写者:潜在水里的火(1476811518)',
                QD_孙笨: '设计者:裸睡天依(2847826324)<br>编写者:潜在水里的火(1476811518)',
                QD_沮授: '设计者:秋(1138146139)<br>编写者:潜在水里的火(1476811518)',
                QD_夏侯渊: '设计者:秋(1138146139)<br>编写者:潜在水里的火(1476811518)',
                QD_宣公主: '设计者:秋(1138146139)<br>编写者:潜在水里的火(1476811518)',
            }; //武将简介
            Object.assign(lib.characterIntro, characterIntro);
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
                    skills: ['QD_kurou'],
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
                    skills: ['凶镬'],
                },
                QD_族吴苋: {
                    sex: 'female',
                    skills: ['贵相', '移荣'],
                },
                QD_神吕布: {
                    sex: 'male',
                    hp: 5,
                    maxHp: 5,
                    skills: ['baonu', 'ol_shenfen', '修罗炼狱戟', '神威', 'wushuang', 'shufazijinguan_skill', '玲珑'],
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
                QD_周瑜: {
                    sex: 'male',
                    skills: ['反间'],
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
                QD_孙权: {
                    sex: 'male',
                    skills: ['会玩'],
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
                        return player.countCards('h') > 0;
                    },
                    filter(event, player) {
                        return game.qcard(player)[0] && player.countCards('hs');
                    },
                    chooseButton: {
                        dialog(event, player) {
                            return ui.create.dialog('蛊惑', [game.qcard(player), 'vcard']);
                        },
                        filter(button, player) {
                            return player.filterCard(button.link[2], true);
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
                            return number0(num) / 2 + 10;
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
                                    var result = true;
                                    var suit = card.suit,
                                        number = card.number;
                                    card.suit = 'none';
                                    card.number = null;
                                    var mod = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
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
                                },//加强于吉AI
                                precontent() {
                                    player.addTempSkill('蛊惑_1');
                                    var card = event.result.cards[0];
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
                        respondShan: true,
                        respondSha: true,
                        skillTagFilter(player) {
                            if (!player.countCards('hs')) {
                                return false;
                            }
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
                                var card = trigger.cards[0];
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
                                            var ally = (button.link[2] == '肯定');
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
                                        var b = event.betrays.includes(i);
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
                            prompt: '移除惑标记,然后视为使用移除的标记数张任意牌',
                            filter: (event, player) => game.countPlayer((Q) => Q.hasMark('蛊惑')),
                            forced: true,
                            async content(event, trigger, player, cards) {
                                const result = await player.chooseTarget('选择移除惑的角色', (card, player, target) => target.hasMark('蛊惑')).forResult();
                                if (result.bool) {
                                    while (result.targets.length) {
                                        result.targets.shift().removeMark('蛊惑');
                                        const result1 = await player
                                            .chooseButton(['视为使用一张牌', [game.qcard(player, false, true, false), 'vcard']])
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
                    check: (event) => event.player.isFriendsOf(_status.event.player),
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
                                        trigger.source.addTempSkill('drlt_xiongluan2', { global: 'roundStart' });
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
                                let dissident = [];
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
                        let count = numberq1(trigger.num);
                        while (count-- > 0) {
                            var E = get.cards(1);
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
                        global: ['loseAfter'],
                    },
                    filter(event, player) {
                        if (event.getParent(2).name == 'recast' || event.parent.name == 'useCard') {
                            return false;
                        }
                        return event.cards && event.cards.some((q) => q.suit == 'spade');
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        var cards = trigger.cards.filter((q) => q.suit == 'spade');
                        player.gain(cards, 'gain2');
                    },
                },
                冲阵: {
                    audio: 'chongzhen', //QQQ
                    charlotte: true,
                    enable: ['chooseToUse', 'chooseToRespond'],
                    prompt: '将一张♥牌当做桃,♦牌当做火杀,♣牌当做闪,♠牌当做无懈可击使用或打出',
                    logTarget(event, player) {
                        if (event.card.name == 'sha') {
                            return event.targets[0];
                        }
                        return event.respondTo[0];
                    },
                    viewAs(cards, player) {
                        var name = false;
                        var nature = null;
                        switch (cards[0]?.suit) {//QQQ
                            case 'club':
                                name = 'shan';
                                break;
                            case 'diamond':
                                name = 'sha';
                                nature = 'fire';
                                break;
                            case 'spade':
                                name = 'wuxie';
                                break;
                            case 'heart':
                                name = 'tao';
                                break;
                        }
                        if (name) {
                            return { name: name, nature: nature };
                        }
                        return null;
                    },
                    hiddenCard(player, name) {
                        if (name == 'wuxie' && _status.connectMode && player.countCards('hes') > 0) {
                            return true;
                        }
                        if (name == 'wuxie') {
                            return player.countCards('hes', { suit: 'spade' }) > 0;
                        }
                        if (name == 'tao') {
                            return player.countCards('hes', { suit: 'heart' }) > 0;
                        }
                    },
                    check(card) {
                        return 90 - get.value(card);
                    },
                    position: 'hes',
                    filterCard(card, player, event) {
                        if (card.suit == 'club' && player.filterCard('shan')) {
                            return true;
                        }
                        if (card.suit == 'diamond' && player.filterCard('sha', true)) {
                            return true;
                        }
                        if (card.suit == 'spade' && player.filterCard('wuxie')) {
                            return true;
                        }
                        if (card.suit == 'heart' && player.filterCard('tao')) {
                            return true;
                        }
                        return false;
                    },
                    selectCard: 1,
                    filter(event, player) {
                        if (player.filterCard('sha', true) && player.countCards('hes', { suit: 'diamond' })) {
                            return true;
                        }
                        if (player.filterCard('shan') && player.countCards('hes', { suit: 'club' })) {
                            return true;
                        }
                        if (player.filterCard('tao') && player.countCards('hes', { suit: 'heart' })) {
                            return true;
                        }
                        if (player.filterCard('wuxie') && player.countCards('hes', { suit: 'spade' })) {
                            return true;
                        }
                        return false;
                    },
                    async precontent(event, trigger, player) {
                        var target = game.players.find((q) => q.isEnemiesOf(player) && q.countCards('he'));
                        if (target) {
                            player.gain(target.getCards('he').randomGet(), 'gain2');
                        }
                    },
                    ai: {
                        respondSha: true,
                        respondShan: true,
                        skillTagFilter(player, tag) {
                            var name;
                            switch (tag) {
                                case 'respondSha':
                                    name = 'diamond';
                                    break;
                                case 'respondShan':
                                    name = 'club';
                                    break;
                                case 'save':
                                    name = 'heart';
                                    break;
                            }
                            if (!player.countCards('hes', { suit: name })) {
                                return false;
                            }
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
                    content() {
                        player.drawTo(Math.min(50, player.maxHp));
                    },
                },
                犀梳: {
                    equipSkill: true,
                    trigger: {
                        player: ['phaseJudgeBefore', 'phaseDiscardBefore'],
                    },
                    forced: true,
                    content() {
                        trigger.cancel();
                    },
                },
                垂涕: {
                    trigger: {
                        global: ['loseAfter'],
                    },
                    forced: true,
                    filter(event, player) {
                        return event.type != 'use' && event.cards && event.cards[0];
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
                        var type = get.type2(card);
                        return type == 'basic' || type == 'trick' || type == 'equip';
                    },
                    async content(event, trigger, player) {
                        const { result: { cards } } = await player.chooseToDiscard('he', get.prompt('zhuangshu', trigger.player), '弃置一张牌,并根据此牌的类型,按如下关系将一张宝物牌置入该角色的装备区:{<基本牌,【琼梳】>,<锦囊牌,【犀梳】>,<装备牌,【金梳】>}.', function (card) {
                            var type = get.type2(card);
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
                            }
                            else if (type == 'trick') {
                                name = '犀梳';
                            }
                            if (lib.card[name] && trigger.player.hasEmptySlot(5)) {
                                var card = game.createCard(name);
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
                    content() {
                        'step 0';
                        player.randomDiscard('h', 6);
                        ('step 1');
                        var list = get.inpile('trick', 'trick').randomGets(3);
                        for (var i = 0; i < list.length; i++) {
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
                    trigger: {
                        player: ['useCardAfter', 'respondAfter'],
                    },
                    forced: true,
                    init(player) {
                        player.disableEquip('equip1');
                    },
                    filter(event, player) {
                        var color = get.color(event.card);
                        if (color == 'none') {
                            return false;
                        }
                        if (get.type(event.card) == 'equip') {
                            return false;
                        }
                        return event.cards && event.cards[0];
                    },
                    prompt2: (event) => '将' + get.translation(event.cards) + '置于武将牌上',
                    content() {
                        player.addToExpansion(trigger.cards, 'gain2').gaintag.add('化木');
                    },
                    ai: {
                        reverseOrder: true,
                        combo: '前盟',
                    },
                    mod: {
                        aiOrder(player, card, num) {
                            if (typeof card == 'object') {
                                var history = game.getGlobalHistory('useCard');
                                if (!history.length) {
                                    return;
                                }
                                var evt = history[history.length - 1];
                                if (evt && evt.card && get.color(evt.card) != 'none' && get.color(card) != 'none' && get.color(evt.card) != get.color(card)) {
                                    return num + 4;
                                }
                            }
                        },
                    },
                    marktext: '木',
                    intro: {
                        name: '灵杉&玉树',
                        markcount(storage, player) {
                            var red = [],
                                black = [];
                            var cards = player.getExpansions('化木');
                            for (const i of cards) {
                                var color = get.color(i, false);
                                (color == 'red' ? red : black).push(i);
                            }
                            return `${black.length}/${red.length}`;
                        },
                        content: 'expansion',
                        mark(dialog, storage, player) {
                            var red = [],
                                black = [];
                            var cards = player.getExpansions('化木');
                            for (const i of cards) {
                                var color = get.color(i, false);
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
                        if (event.type == 'wuxie') {
                            return false;
                        }
                        if (player.filterCard('tao') && player.getExpansions('化木').filter((i) => get.color(i) == 'red').length) {
                            return true;
                        }
                        if (player.filterCard('jiu') && player.getExpansions('化木').filter((i) => get.color(i) == 'black').length) {
                            return true;
                        }
                        return false;
                    },
                    chooseButton: {
                        dialog() {
                            return ui.create.dialog('良缘', [['tao', 'jiu'], 'vcard'], 'hidden');
                        },
                        filter(button, player) {
                            var name = button.link[2],
                                color = name == 'tao' ? 'red' : 'black';
                            var cards = player.getExpansions('化木').filter((i) => get.color(i, false) == color);
                            if (!cards.length) {
                                return false;
                            }
                            return player.filterCard(name);
                        },
                        check(button) {
                            if (_status.event.parent.type != 'phase') {
                                return 1;
                            }
                            const player = _status.event.player;
                            const name = button.link[2],
                                color = name == 'tao' ? 'red' : 'black';
                            return number0(player.getUseValue(button.link, null, true)) / 2 + 10;
                        },
                        backup(links, player) {
                            var name = links[0][2],
                                color = name == 'tao' ? 'red' : 'black';
                            var cards = player.getExpansions('化木').filter((i) => get.color(i, false) == color);
                            if (!cards.length) {
                                return false;
                            }
                            var card = { name: name };
                            return {
                                viewAs: card,
                                color: color,
                                selectCard: -1,
                                filterCard: () => false,
                                precontent() {
                                    var color = lib.skill.良缘_backup.color;
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
                            var name = links[0][2],
                                color = name == 'tao' ? '玉树' : '灵杉';
                            return `将一枚<${color}>当做【${get.translation(name)}】使用`;
                        },
                    },
                    ai: {
                        basic: {
                            order: 1,
                        },
                        order(name, player) {
                            return 1;
                        },
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
                        global: ['loseAfter', 'equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
                    },
                    filter(event, player) {
                        if (event.name == 'addToExpansion') {
                            return event.gaintag.includes('化木');
                        }
                        if (event.name == 'lose' && event.getlx !== false) {
                            for (var i in event.gaintag_map) {
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
                            for (var i in evt.gaintag_map) {
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
                    limited: true,
                    skillAnimation: true,
                    animationColor: 'metal',
                    content() {
                        'step 0';
                        player
                            .chooseTarget(get.prompt('羁肆'), lib.filter.notMe)
                            .set('ai', function (target) {
                                if (!_status.event.goon) {
                                    return false;
                                }
                                var att = get.attitude(player, target);
                                if (att < 4) {
                                    return false;
                                }
                                return att;
                            })
                            .set(
                                'goon',
                                (function () {
                                    if (player.hasUnknown() || player.identity == 'nei') {
                                        return false;
                                    }
                                    return true;
                                })()
                            );
                        ('step 1');
                        if (result.bool) {
                            var target = result.targets[0];
                            event.target = target;
                            player.awakenSkill('羁肆');
                        } else {
                            event.finish();
                        }
                        ('step 2');
                        target.addSkill('前盟');
                    },
                    mark: true,
                    intro: {
                        content: 'limited',
                    },
                    init: (player, skill) => (player.storage[skill] = false),
                    markimage: 'extension/OLUI/image/player/marks/xiandingji.png',
                },
                恂恂: {
                    trigger: {
                        player: ['changeHp'],
                        global: ['roundStart'],
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        let count = numberq1(trigger.num);
                        while (count-- > 0) {
                            var cards = get.cards(5);
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
                                    return number0(num) / 2 + 10;
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
                        return game.qcard(player, 'basic').length && game.hasPlayer((Q) => !Q.isLinked());
                    },
                    chooseButton: {
                        dialog(event, player) {
                            return ui.create.dialog('娴婉', [game.qcard(player, 'basic'), 'vcard'], 'hidden');
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
                                return number0(num) + 10;
                            } //神杀优先无脑提高会导致出杀默认神杀,碰到对神杀高收益的就会卡死
                            return number0(num) / 2 + 10; //不加这行会出现有button返回undefined导致无法判断直接结束回合
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
                                precontent() {
                                    game.log('#g【娴婉】', event.result.card);
                                    player.popup(event.result.card, 'thunder');
                                    var E = game.players
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
                                return game.qcard(player, 'trick').length && game.hasPlayer((Q) => Q.isLinked());
                            },
                            chooseButton: {
                                dialog(event, player) {
                                    return ui.create.dialog('娴婉', [game.qcard(player, 'trick'), 'vcard']);
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
                                    return number0(num) / 2 + 10;
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
                                        precontent() {
                                            game.log('#g【娴婉】', event.result.card);
                                            player.popup(event.result.card, 'thunder');
                                            var E = game.players
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
                        player: ['changeHp', 'loseAfter'],
                    },
                    filter(event, player) {
                        if (event.name == 'changeHp') {
                            return true;
                        }
                        if (event.getParent('phaseUse', true) && _status.currentPhase == player) {
                            return false;
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
                                    var player = _status.event.player;
                                    var mod2 = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
                                    if (mod2 != 'unchanged') {
                                        return mod2;
                                    }
                                    var mod = game.checkMod(card, player, 'unchanged', 'cardRespondable', player);
                                    if (mod != 'unchanged') {
                                        return mod;
                                    }
                                    return true;
                                }).ai = function (card) {
                                    var trigger = _status.event.parent._trigger;
                                    var player = _status.event.player;
                                    var result = trigger.judge(card) - trigger.judge(trigger.player.judging[0]);
                                    var attitude = get.attitude(player, trigger.player);
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
                                        var player = _status.event.player;
                                        var current = _status.currentPhase;
                                        var dis = current ? get.distance(current, target, 'absolute') : 1;
                                        var draw = player.getDamagedHp();
                                        var att = get.attitude(player, target);
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
                                            if (current && target.getSeatNum() > current.getSeatNum()) {
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
                                            if (current && target.getSeatNum() <= current.getSeatNum()) {
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
                                    player(player, target, card) {//主动技是否发动
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
                                    let eq = player.getEquip(get.subtype(card));
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
                                var mod = game.checkMod(card, player, event, 'unchanged', 'cardDiscardable', player);
                                if (mod != 'unchanged') {
                                    return mod;
                                }
                                return true;
                            },
                            discard: false,
                            lose: false,
                            delay: false,
                            selectCard: [1, Infinity],
                            prompt: '弃置一枚<忍>,然后弃置任意张牌并摸等量的牌.若弃置了所有的手牌,则可以多摸一张牌',
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
                                var hs = player.getCards('h');
                                if (!hs.length) {
                                    event.num = 0;
                                }
                                for (var i = 0; i < hs.length; i++) {
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
                                nokeep: true,
                                skillTagFilter(player, tag, arg) {
                                    if (tag === 'nokeep') {
                                        return player.isPhaseUsing() && !player.getStat().skill.jilue_zhiheng && player.hasCard((card) => card.name !== 'tao', 'h');
                                    }
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
                    init: (p) => (p.storage.QD_kuroux = 0),
                    filter: (e, p) => p.storage.QD_kuroux > 0,
                    async content(event, trigger, player) {
                        player.storage.QD_kuroux--;
                        player.phase();
                    },
                    group: ['QD_kuroux_1'],
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
                涉猎: {
                    audio: 'shelie',
                    trigger: {
                        player: 'phaseDrawBegin1',
                    },
                    forced: true,
                    content() {
                        trigger.changeToZero();
                        var cards = [];
                        for (const i of lib.suits) {
                            var card = get.cardPile2(function (card) {
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
                // 当你体力值变化/出牌阶段内不因使用失去牌/出牌阶段外失去牌时,你摸一张牌,将一张牌称为<权>置于武将牌上
                // 你的手牌上限+X(X为<权>的数量)
                权计: {
                    trigger: {
                        player: ['changeHp', 'loseAfter'],
                    },
                    forced: true,
                    filter(event, player) {
                        if ('lose' == event.name) {
                            if (event.getParent('权计', true)) {
                                return false;
                            }
                            if (player == _status.currentPhase && event.getParent('phaseUse', true)) {
                                return event.parent.name != 'useCard';
                            }
                        }
                        return true;
                    },
                    async content(event, trigger, player) {
                        let count = numberq1(trigger.num || trigger.cards?.length);
                        while (count-- > 0) {
                            await player.draw();
                            if (player.countCards('he')) {
                                const { result: { cards } } = await player.chooseCard('he', true, '选择一张牌作为<权>')
                                    .set('ai', (c) => 6 - get.value(c));
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
                    group: ['拒战_1', '拒战_2'],
                    subSkill: {
                        1: {
                            audio: 'nzry_juzhan_1',
                            trigger: {
                                target: 'useCardToTarget',
                            },
                            prompt2: '当你成为其他角色牌的目标后,你与其各摸一张牌,然后其本回合内不能再对你使用牌',
                            filter(event, player) {
                                return player != event.player;
                            },
                            forced: true,
                            logTarget: 'player',
                            content() {
                                'step 0';
                                player.draw();
                                trigger.player.draw();
                                trigger.player.addTempSkill('nzry_juzhany');
                                player.addTempSkill('nzry_juzhanx');
                                ('step 1');
                            },
                        },
                        2: {
                            audio: 'nzry_juzhan_1',
                            trigger: {
                                player: 'useCardToPlayered',
                            },
                            prompt2: '当你使用牌指定一名角色为目标后,你可以获得其一张牌',
                            filter(event, player) {
                                return player != event.target && event.target.countGainableCards(player, 'he') > 0;
                            },
                            forced: true,
                            logTarget: 'target',
                            content() {
                                player.gainPlayerCard(trigger.target, 'he', true);
                            },
                        },
                    },
                },
                夷灭: {
                    forced: true,
                    preHidden: true,
                    trigger: {
                        source: 'damageBefore',
                    },
                    filter(event, player) {
                        return player != event.player && event.num < event.player.hp;
                    },
                    logTarget: 'player',
                    content() {
                        trigger.num = trigger.player.hp;
                    },
                },
                泰然: {
                    trigger: {
                        player: 'phaseEnd',
                    },
                    forced: true,
                    preHidden: true,
                    filter(event, player) {
                        return player.hp < player.maxHp || player.countCards('h') < player.maxHp;
                    },
                    content() {
                        'step 0';
                        var num = player.maxHp - player.hp;
                        if (num > 0) {
                            player.recover(num);
                        }
                        ('step 1');
                        if (player.countCards('h') < player.maxHp) {
                            player.drawTo(player.maxHp).gaintag = ['tairan'];
                        }
                    },
                    ai: {
                        threaten: 0.4,
                    },
                },
                凶镬: {
                    group: ['凶镬_damage', '凶镬_begin', '凶镬_dying'],
                    marktext: '凶镬',
                    mark: true,
                    intro: {
                        name: '凶镬',
                        name2: '凶镬',
                        content: 'mark',
                    },
                    init(player) {
                        player.addMark('凶镬', 3);
                    },
                    mod: {
                        maxHandcard(player, num) {
                            for (const i of game.players) {
                                num += i.countMark('凶镬');
                            }
                            return num;
                        }, //QQQ
                    },
                    audio: 'xinfu_xionghuo',
                    enable: 'phaseUse',
                    filter(event, player) {
                        return player.countMark('凶镬') > 0;
                    },
                    filterTarget(card, player, target) {
                        return player != target;
                    },
                    content() {
                        player.removeMark('凶镬', 1);
                        target.addMark('凶镬', 1);
                    },
                    subSkill: {
                        begin: {
                            audio: 'xinfu_xionghuo',
                            logTarget: 'player',
                            line: false,
                            forced: true,
                            trigger: {
                                global: 'phaseUseBegin',
                            },
                            filter(event, player) {
                                return event.player.countMark('凶镬') > 0 && event.player != player;
                            },
                            async content(event, trigger, player) {
                                event.count = trigger.player.countMark('凶镬');
                                while (event.count > 0) {
                                    event.count--;
                                    var Q = [1, 2, 3].randomGet();
                                    if (Q == 1) {
                                        player.line(trigger.player, 'fire');
                                        trigger.player.damage('fire');
                                        trigger.player.addTempSkill('不能出杀');
                                        game.log('#g【凶镬1】');
                                    }
                                    if (Q == 2) {
                                        player.line(trigger.player, 'water');
                                        trigger.player.loseHp();
                                        trigger.player.addMark('减手牌上限', 1, false);
                                        trigger.player.addSkill('减手牌上限');
                                        game.log('#g【凶镬2】');
                                    }
                                    if (Q == 3) {
                                        player.line(trigger.player, 'green');
                                        var card1 = trigger.player.getCards('h').randomGet();
                                        var card2 = trigger.player.getCards('e').randomGet();
                                        var list = [];
                                        if (card1) {
                                            list.push(card1);
                                        }
                                        if (card2) {
                                            list.push(card2);
                                        }
                                        if (list.length) {
                                            await player.gain(list, trigger.player, 'giveAuto', 'bySelf');
                                        }
                                        game.log('#g【凶镬3】');
                                    }
                                }
                            },
                        },
                        damage: {
                            audio: 'xinfu_xionghuo',
                            forced: true,
                            trigger: {
                                source: 'damageBefore',
                            },
                            filter(event, player) {
                                return event.player.countMark('凶镬') > 0 && event.player != player;
                            },
                            content() {
                                trigger.num += trigger.player.countMark('凶镬');
                            },
                        },
                        dying: {
                            audio: 'xinfu_xionghuo',
                            trigger: {
                                global: 'dying',
                            },
                            forced: true,
                            content() {
                                player.addMark('凶镬', 1);
                            },
                        },
                    },
                    ai: {
                        order: 11,
                        result: {
                            target(player, target) {
                                if (
                                    game.hasPlayer(function (Q) {
                                        return Q.countMark('凶镬') < 2 && Q.isEnemiesOf(player);
                                    }) &&
                                    target.countMark('凶镬') >= 2
                                ) {
                                    return 0;
                                }
                                if (target.isEnemiesOf(player) && target.countMark('凶镬') == 1) {
                                    return -5;
                                }
                                return -1;
                            },
                        },
                        effect: {
                            player(card, player, target) {
                                if (
                                    player != target &&
                                    get.tag(card, 'damage') &&
                                    target &&
                                    target.hasMark('凶镬') &&
                                    !target.hasSkillTag('filterDamage', null, {
                                        player: player,
                                        card: card,
                                    })
                                ) {
                                    return [1, 0, 1, -2 * target.countMark('凶镬')];
                                }
                            },
                        },
                        threaten: 1.6,
                    },
                },
                不能出杀: {
                    mod: {
                        cardEnabled(card) {
                            if (card.name == 'sha') {
                                return false;
                            }
                        },
                    },
                    charlotte: true,
                    mark: true,
                    marktext: '禁',
                    intro: {
                        content: '不能使用【杀】',
                    },
                },
                减手牌上限: {
                    mod: {
                        maxHandcard(player, num) {
                            return num - player.countMark('减手牌上限');
                        },
                    },
                    marktext: '减',
                    mark: true,
                    charlotte: true,
                    intro: {
                        content: '手牌上限-#',
                    },
                },
                贵相: {
                    trigger: {
                        player: ['phaseZhunbeiBegin', 'phaseDrawBefore', 'phaseJudgeBefore', 'phaseDiscardBefore', 'phaseJieshuBegin'],
                    },
                    forced: true,
                    content() {
                        trigger.cancel();
                        var next = player.phaseUse();
                        event.next.remove(next);
                        trigger.parent.next.push(next);
                    },
                },
                移荣: {
                    mod: {
                        maxHandcard(player, num) {
                            var add = player.storage.移荣;
                            if (typeof add == 'number') {
                                return num + add;
                            }
                        },
                    },
                    enable: 'phaseUse',
                    usable: 1,
                    mark: true,
                    intro: {
                        name: '手牌上限',
                        content: 'mark',
                    },
                    content() {
                        var num1 = player.countCards('h');
                        var num2 = player.getHandcardLimit();
                        if (num1 < num2) {
                            player.draw(num2 - num1);
                        }
                        player.addMark('移荣');
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
                    group: ['移荣_M'],
                    subSkill: {
                        M: {
                            trigger: {
                                player: ['phaseEnd'],
                            },
                            forced: true,
                            content() {
                                player.removeMark('移荣', 4);
                            },
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
                    content() {
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
                                player: 'useCard',
                            },
                            filter(event, player) {
                                return event.card && !['equip', 'delay'].includes(get.type(event.card));
                            },
                            _priority: 23,
                            forced: true,
                            content() {
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
                玲珑: {
                    trigger: {
                        target: 'useCardToTargeted',
                    },
                    forced: true,
                    filter(event, player) {
                        return !player.hasSkillTag('unequip2') && !event.player.hasSkillTag('unequip');
                    },
                    async content(event, trigger, player) {
                        if (get.effect(player, trigger.card, trigger.player, player) < 0) {
                            var E = get.cards(1);
                            game.cardsGotoOrdering(E);
                            player.showCards(E, '玲珑');
                            if (get.color(E[0]) == 'red') {
                                trigger.parent.excluded.add(player);
                            }
                        }
                    },
                },
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
                        player: 'useCardToPlayer',
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
                                            var equip1 = player.getEquip('zhuque');
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
                        const list = game.qcard(player, false, false).filter((q) => lib.card[q[2]].ai?.tag?.damage > 0);
                        var q = true;
                        while (q) {
                            var w = {};
                            for (const i of game.players.filter((q) => q != player)) {
                                w[i.name] = i.hp;
                            }
                            for (const i of game.players) {
                                const { result } = await i.chooseButton(['视为使用无距离限制的杀或者伤害类锦囊', [list, 'vcard']]).set('ai', (button) => {
                                    const num = i.getUseValue({
                                        name: button.link[2],
                                        nature: button.link[3],
                                    }, null, true);
                                    return number0(num) / 2 + 10;
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
                            q = false;
                            for (const i of game.players.filter((q) => q != player)) {
                                if (i.hp >= w[i.name]) {
                                    q = true;
                                }
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
                        target: 'useCardToTargeted',
                    },
                    filter(event, player) {
                        return event.player != player && event.card;
                    },
                    check(event, player) {
                        let evt = event.parent;
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
                        const Q = [];
                        let num = player.getDamagedHp();
                        while (num > 0) {
                            const result = await player
                                .chooseTarget(`获得任意名角色区域内的至多${num}张牌`, (card, player, target) => {
                                    return (
                                        target != player &&
                                        target.hasCard((T) => {
                                            const G = _status.event.Q.find((item) => item[0] == target);
                                            if (G && G[1].includes(T)) {
                                                return false;
                                            }
                                            return lib.filter.canBeGained(T, player, target);
                                        }, 'hej')
                                    );
                                })
                                .set('ai', (target) => {
                                    const player = _status.event.player,
                                        G = _status.event.Q.find((item) => item[0] == target);
                                    if (G && G[1].length >= target.countCards('he')) {
                                        return 0;
                                    }
                                    return get.effect(target, { name: 'shunshou' }, player, player);
                                })
                                .set('Q', Q)
                                .forResult();
                            if (result.bool) {
                                const target = result.targets[0];
                                const cards = await player
                                    .choosePlayerCard(target, true, 'hej', [1, num], `选择获得${get.translation(target)}区域内的牌`)
                                    .set('filterButton', (button) => {
                                        const card = button.link,
                                            target = _status.event.target,
                                            player = get.player();
                                        const G = _status.event.Q.find((item) => item[0] == target);
                                        if (G && G[1].includes(card)) {
                                            return false;
                                        }
                                        return lib.filter.canBeGained(card, player, target);
                                    })
                                    .set('Q', Q)
                                    .set('ai', (button) => {
                                        if (ui.selected.buttons.length) {
                                            return false;
                                        }
                                        var val = get.buttonValue(button, _status.event.target);
                                        if (get.attitude(_status.event.player, _status.event.target) > 0) {
                                            return -val;
                                        }
                                        return val;
                                    })
                                    .forResultCards();
                                num -= cards.length;
                                const index = Q.find((item) => item[0] == target);
                                if (!index) {
                                    Q.push([target, cards]);
                                } else {
                                    index[1].addArray(cards);
                                }
                            } else {
                                break;
                            }
                        }
                        player.draw(num);
                        if (Q.length) {
                            if (Q[0].length == 1) {
                                player.gain(Q[0][1], 'gain2');
                            } else {
                                for (const i of Q) {
                                    player.gain(i[1], 'gain2');
                                }
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
                        ignoredHandcard(card, player) {
                            if (player.storage.QD_shuangjia.includes(card)) {
                                return true;
                            }
                        },
                        cardDiscardable(card, player, name) {
                            if (name == 'phaseDiscard' && player.storage.QD_shuangjia.includes(card)) {
                                return false;
                            }
                        },
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
                                await player.gain(cards, 'gain2');//不await的话两次都会检索同一批牌
                            }
                        }
                    },
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
                                var card = ui.selected.cards[0];
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
                        ignoredHandcard: (card, player) => get.color(card) == 'black',
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
                        const { result: { moved } } = await player
                            .chooseToMove()
                            .set('list', [['牌堆顶', cardx], ['牌堆底']])
                            .set('prompt', '将牌移动到牌堆顶或牌堆底')
                            .set('processAI', function (list) {
                                const cards = list[0][1];
                                const target = event.player;
                                const att = get.sgn(get.attitude(player, target));
                                const top = [];
                                if (target.countCards('j')) {
                                    for (const i of player.getCards('j')) {
                                        const judge = get.judge(i);
                                        cards.sort((a, b) => (judge(b) - judge(a)) * att); //态度大于0就把价值高的牌放前面
                                        top.push(cards.shift());
                                    }
                                } else {
                                    cards.sort((a, b) => (get.value(b) - get.value(a)) * att); //态度大于0就把价值高的牌放前面
                                    while (cards.length) {
                                        if (get.value(cards[0]) < 6 == att > 0) {
                                            break;
                                        }
                                        top.push(cards.shift());
                                    }
                                }
                                return [top, cards];
                            }); //给别人观星
                        if (moved?.length) {
                            moved[0].reverse();
                            for (const i of moved[0]) {
                                ui.cardPile.insertBefore(i, ui.cardPile.firstChild);
                            }
                            for (const i of moved[1]) {
                                ui.cardPile.appendChild(i);
                            }
                            game.log(`${moved[0].length}上${moved[1].length}下`);
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
                        const { result: { moved } } = await player
                            .chooseToMove()
                            .set('list', [['牌堆顶', cardx], ['牌堆底']])
                            .set('prompt', '将牌移动到牌堆顶或牌堆底')
                            .set('processAI', function (list) {
                                const cards = list[0][1];
                                const top = [];
                                if (player.countCards('j')) {
                                    for (const i of player.getCards('j')) {
                                        const judge = get.judge(i);
                                        cards.sort((a, b) => judge(b) - judge(a)); //态度大于0就把价值高的牌放前面//返回正值就是b在a前
                                        top.push(cards.shift());
                                    }
                                } else {
                                    cards.sort((a, b) => get.value(b) - get.value(a)); //态度大于0就把价值高的牌放前面
                                    while (cards.length) {
                                        if (get.value(cards[0]) < 6) {
                                            break;
                                        }
                                        top.push(cards.shift());
                                    }
                                }
                                return [top, cards];
                            }); //自己观星
                        if (moved?.length) {
                            moved[0].reverse();
                            for (const i of moved[0]) {
                                ui.cardPile.insertBefore(i, ui.cardPile.firstChild);
                            }
                            for (const i of moved[1]) {
                                ui.cardPile.appendChild(i);
                            }
                            game.log(`${moved[0].length}上${moved[1].length}下`);
                        }
                    },
                },
                //空城
                //①若你手牌只有一种类型,你不能成为伤害牌的目标②回合结束时,若你手牌只有一种类型,则取消①中的条件直至你回合开始
                QD_kongcheng: {
                    mod: {
                        targetEnabled(card, player, target, now) {
                            if (get.tag(card, 'damage')) {
                                if (target.storage.QD_kongcheng || target.getCards('h').map((q) => get.type(q)).unique().length < 2) {
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
                            if (player.storage.QD_kongcheng || player.getCards('h').map((q) => get.type(q)).unique().length < 2) {
                                return '空城生效';
                            }
                            return '空城无效';
                        },
                    },
                    filter(event, player) {
                        return player.getCards('h').map((q) => get.type(q)).unique().length < 2;
                    },
                    async content(event, trigger, player) {
                        player.storage.QD_kongcheng = true;
                        player.when({ player: 'phaseBegin' }).then(() => player.storage.QD_kongcheng = false);
                    },
                },
                给橘: {
                    trigger: {
                        player: 'phaseUseBegin',
                    },
                    forced: true,
                    content() {
                        'step 0';
                        player.chooseTarget(get.prompt('给橘'), '移去一个【橘】或失去1点体力,然后令一名其他角色获得一个【橘】', function (card, player, target) {
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
                    group: ['橘_1', '橘_2'],
                    subSkill: {
                        1: {
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
                        },
                        2: {
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
                // 当一名角色判定结束后,若结果为:♠️,你对一名角色造成2点雷电伤害;♣️,你回复1点体力并对一名角色造成1点雷电伤害
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
                        const { result: { targets } } = await player.chooseTarget(`对一名角色造成${num}点雷电伤害`, lib.filter.notMe)
                            .set('ai', (t) => -get.attitude(player, t));
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
                                return event.player != _status.currentPhase;
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
                        }
                    }
                },
                鬼道: {
                    trigger: {
                        global: 'judge',
                    },
                    filter(event, player) {
                        return player.countCards('hes') > 0;
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        const { result } = await player.chooseCard(get.translation(trigger.player) + '的' + (trigger.judgestr || '') + `判定为${get.translation(trigger.player.judging[0])},` + get.prompt('xinguidao'), 'hes', true).set('ai', function (card) {
                            var result = trigger.judge(card) - trigger.judge(trigger.player.judging[0]);
                            var attitude = get.attitude(player, trigger.player);
                            if (attitude == 0 || result == 0) {
                                return 0;
                            }
                            if (card.suit == 'spade') {
                                result += 4;
                            }
                            if (card.suit == 'club') {
                                result += 3;
                            }
                            if (attitude > 0) {
                                return result;
                            } else {
                                return -result;
                            }
                        });
                        if (result.cards && result.cards[0]) {
                            player.respond(result.cards, 'highlight', 'xinguidao', 'noOrdering');
                            player.gain(trigger.player.judging[0]);
                            player.draw('nodelay');
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
                反间: {
                    enable: 'phaseUse',
                    filter(event, player) {
                        return player.countCards('h') > 0;
                    },
                    filterTarget(card, player, target) {
                        return player != target;
                    },
                    content() {
                        'step 0';
                        target.chooseControl('heart2', 'diamond2', 'club2', 'spade2').set('ai', function (event) {
                            switch (Math.floor(Math.random() * 6)) {
                                case 0:
                                    return 'heart2';
                                case 1:
                                case 4:
                                case 5:
                                    return 'diamond2';
                                case 2:
                                    return 'club2';
                                case 3:
                                    return 'spade2';
                            }
                        });
                        ('step 1');
                        game.log(target, '选择了' + get.translation(result.control));
                        event.choice = result.control;
                        target.chat('我选' + get.translation(event.choice));
                        target.gainPlayerCard(player, true, 'h');
                        ('step 2');
                        if (result.bool && result.cards[0].suit + '2' != event.choice) {
                            target.damage('nocard');
                        }
                    },
                    ai: {
                        order: 1,
                        result: {
                            target(player, target) {
                                var eff = get.damageEffect(target, player);
                                if (eff >= 0) {
                                    return 1 + eff;
                                }
                                var value = 0,
                                    i;
                                var cards = player.getCards('h');
                                for (var i = 0; i < cards.length; i++) {
                                    value += get.value(cards[i]);
                                }
                                value /= player.countCards('h');
                                if (target.hp == 1) {
                                    return Math.min(0, value - 7);
                                }
                                return Math.min(0, value - 5);
                            },
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
                                        if (target != q) return false;
                                    }
                                },
                                targetEnabled(card, player, target) {
                                    const q = game.players.find((i) => i.hasSkill('QD_wangzun'));
                                    if (q) {
                                        if (target != q) return false;
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
                据守: {
                    mod: {
                        playerEnabled(card, player, target) {
                            if (player.hujia < 5 && player != target) {
                                return false;
                            }
                        },
                    },
                    audio: 'sbjushou',
                    trigger: {
                        player: 'phaseDiscardBegin',
                    },
                    forced: true,
                    group: ['据守_1', '据守_2'],
                    content() {
                        var cards = player.getCards('h');
                        var num = cards.length;
                        player.discard(cards);
                        player.turnOver();
                        player.changeHujia(num);
                    },
                    subSkill: {
                        1: {
                            audio: 'sbjushou',
                            trigger: {
                                player: 'damageEnd',
                            },
                            forced: true,
                            content() {
                                player.changeHujia(1);
                            },
                        },
                        2: {
                            trigger: {
                                player: 'phaseDrawBegin2',
                            },
                            forced: true,
                            content() {
                                trigger.num += Math.ceil(Math.sqrt(player.hujia));
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
                        var equip = Array.from(ui.cardPile.childNodes)
                            .filter((Q) => get.type(Q) == 'equip' && event.target.canEquip(Q))
                            .randomGet();
                        if (equip) {
                            event.target.equip(equip, 'gain2');
                        }
                        player.draw();
                        player.recover();
                        var equip = Array.from(ui.cardPile.childNodes)
                            .filter((Q) => get.type(Q) == 'equip' && player.canEquip(Q))
                            .randomGet();
                        if (equip) {
                            player.equip(equip, 'gain2');
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
                                var num = 1;
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
                        var cards = trigger.cards.filterInD('od');
                        player.gain(cards, 'log', 'gain2');
                    },
                },
                慷忾: {
                    trigger: {
                        global: 'useCardToTargeted',
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
                            const { result: { cards } } = await player.chooseCard(true, 'h', `交给${get.translation(trigger.target)}一张牌`).set('ai', function (card) {
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
                        let count = numberq1(trigger.num);
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
                        let count = trigger.num;
                        while (count-- > 0 && game.hasPlayer((q) => q.countCards('he') && q.isEnemiesOf(player))) {
                            const { result } = await player.chooseTarget('获得其他角色的一张牌', true, (card, player, target) => target.countCards('he') && target.isEnemiesOf(player)).set('ai', (target) => -get.attitude(player, target));
                            if (result.targets && result.targets[0]) {
                                player.gainPlayerCard(result.targets[0], 'he', true);
                                trigger.num--;
                            }
                        }
                    },
                },
                镇卫: {
                    audioname: ['re_wenpin'],
                    trigger: {
                        global: 'useCardToTarget',
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
                            var cards = trigger.cards.filterInD();
                            if (cards.length) {
                                trigger.player.addSkill('zhenwei2');
                                trigger.player.addToExpansion(cards, 'gain2').gaintag.add('zhenwei2');
                            }
                            trigger.targets.length = 0;
                            trigger.parent.triggeredTargets2.length = 0;
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
                        player.syncStorage('诓人_draw');
                        player.updateMarks('诓人_draw');
                    },
                    intro: {
                        content: 'expansion',
                        markcount: 'expansion',
                    },
                    onremove(player, skill) {
                        var cards = player.getExpansions(skill);
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
                                var storage = player.storage.诓人_draw;
                                if (storage.length) {
                                    for (var i = 0; i < storage[0].length; i++) {
                                        var target = storage[0][i],
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
                        let count = numberq1(trigger.num);
                        while (count-- > 0) {
                            var list = [];
                            var choiceList = ['令一名角色回复1点体力', '令一名角色失去1点体力', '令一名角色弃置两张牌', '令一名角色摸两张牌'];
                            const { result } = await player
                                .chooseControl('选项一', '选项二', '选项三', '选项四')
                                .set('prompt', get.prompt('落宠'))
                                .set('choiceList', choiceList)
                                .set('ai', function (event, player) {
                                    var list = _status.event.controls.slice(0);
                                    var gett = function (choice) {
                                        var max = 0,
                                            func = {
                                                选项一(target) {
                                                    max = get.effect(target, { name: 'tao' }, player, player);
                                                },
                                                选项二(target) {
                                                    max = get.effect(target, { name: 'losehp' }, player, player);
                                                },
                                                选项三(target) {
                                                    max = 1.5 * get.effect(target, { name: 'guohe_copy2' }, player, player);
                                                },
                                                选项四(target) {
                                                    max = get.effect(target, { name: 'wuzhong' }, player, player);
                                                },
                                            }[choice];
                                        game.countPlayer(function (current) {
                                            func(current);
                                        });
                                        return max;
                                    };
                                    return list.sort(function (a, b) {
                                        return gett(b) - gett(a);
                                    })[0];
                                });
                            var index = ['选项一', '选项二', '选项三', '选项四'].indexOf(result.control);
                            var list = [
                                ['令一名角色回复1点体力', (target) => get.recoverEffect(target, player, player)],
                                ['令一名角色失去1点体力', (target) => get.effect(target, { name: 'losehp' }, player, player)],
                                ['令一名角色弃置两张牌', (target) => get.effect(target, { name: 'guohe_copy2' }, player, player) * Math.min(1.5, target.countCards('he'))],
                                ['令一名角色摸两张牌', (target) => get.effect(target, { name: 'wuzhong' }, player, player)],
                            ][index];
                            const { result: result1 } = await player.chooseTarget(list[0], true).set('ai', list[1]);
                            if (result1.targets && result1.targets[0]) {
                                var target = result1.targets[0];
                                switch (index) {
                                    case 0:
                                        target.recover();
                                        break;
                                    case 1:
                                        target.loseHp();
                                        break;
                                    case 2:
                                        target.chooseToDiscard(true, 'he', 2);
                                        break;
                                    case 3:
                                        target.draw(2);
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
                                source: ['damageSource'],
                                global: ['roundStart'],
                            },
                            forced: true,
                            async content(event, trigger, player) {
                                let count = numberq1(trigger.num);
                                while (count-- > 0) {
                                    if (player == _status.currentPhase) {
                                        player.addMark('制衡');
                                    } else {
                                        var list = ['增加次数', '发动制衡'];
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
                        target: 'useCardToTarget',
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
                            var evt = trigger.parent;
                            evt.triggeredTargets2.remove(player);
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
                    animationColor: 'metal',
                    skillAnimation: 'legend',
                    async content(event, trigger, player) {
                        const Q = [];
                        let num = 3;
                        while (num > 0) {
                            const result = await player
                                .chooseTarget(`分配${num}点火焰伤害`, true, (card, player, target) => {
                                    return target.isEnemiesOf(player);
                                })
                                .set('ai', (target) => {
                                    return get.damageEffect(target, _status.event.player, target, 'fire');
                                })
                                .set('Q', Q)
                                .forResult();
                            if (result.bool) {
                                const target = result.targets[0];
                                num--;
                                const index = Q.find((item) => item[0] == target);
                                if (!index) {
                                    Q.push([target, 1]);
                                } else {
                                    index[1]++;
                                }
                            } else {
                                break;
                            }
                        }
                        if (Q.length) {
                            if (Math.random() > 0.5) {
                                game.playAudio('../extension/缺德扩展/audio/天降业火.mp3');
                            } else {
                                game.playAudio('../extension/缺德扩展/audio/业火燎原.mp3');
                            }
                            if (Q[0].length == 1) {
                                Q[0][0].damage(Q[0][1], 'fire');
                            } else {
                                for (const i of Q) {
                                    i[0].damage(i[1], 'fire');
                                }
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
                        player.chooseToUse(
                            function (card, player, event) {
                                return lib.filter.cardEnabled.apply(this, arguments);
                            },
                            '使用一张牌',
                            false
                        );
                    },
                },
                夺锐属性: {
                    audio: 'drlt_duorui',
                    trigger: {
                        player: 'useCardToPlayered',
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
                        var Q = ['体力上限', '手牌上限', '攻击范围', '摸牌数', '出杀数'].randomGet();
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
                                var info = player.storage.夺锐属性_1;
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
                                    var info = player.storage.夺锐属性_2;
                                    var str = '已被夺锐的基础属性:';
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
                                var info = player.storage.夺锐属性_2;
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
                            if (player.storage.夺锐属性_1) {
                                var storage = player.storage.夺锐属性_1;
                                var str = '已夺锐基础属性:';
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
                                var str = '暂未夺锐基础属性';
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
                    audio: 'ext:缺德扩展/audio:2',
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
                        const { result: { links } } = await player.chooseButton(['弃置任意张<幻身>', [player.storage.QD_huanshen, 'character']], true, [1, player.storage.QD_huanshen.length])
                            .set('ai', (button) => Math.random() - 0.5);
                        if (links && links[0]) {
                            let num = links.length;
                            game.log(`<span class="greentext">${get.translation(player)}弃置了<幻身>${get.translation(links)}</span>`);
                            player.storage.QD_huanshen.removeArray(links);
                            player.storage.QD_huanshen.addArray(_status.characterlist.randomGets(num * 2));
                            while (num-- > 0) {
                                player.gainMaxHp();
                                player.changeHujia(3);
                                const { result: { links: links1 } } = await player.chooseButton(['获得一张<幻身>上的所有技能', [player.storage.QD_huanshen, 'character']], true)
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
                            audio: 'ext:缺德扩展/audio:2',
                            superCharlotte: true,
                            charlotte: true,
                            fixed: true,
                            forced: true,
                            _priority: Infinity,
                            async content(event, trigger, player) {
                                player.storage.QD_huanshen.addArray(_status.characterlist.randomGets(trigger.num * 2));
                            },
                        }
                    }
                },
                QD_xianshu: {
                    trigger: {
                        player: ['dying'],
                    },
                    forced: true,
                    content() {
                        'step 0';
                        var T = [];
                        var E = Array.from(ui.cardPile.childNodes);
                        game.countPlayer(function (current) {
                            E.addArray(current.getCards('hej'));
                        });
                        for (const i of E) {
                            if (i.name == 'tao' || i.name == 'jiu') {
                                T.push(i);
                            }
                        }
                        if (T.length) {
                            var A = T.randomGet();
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
                        player: ['loseAfter'],
                    },
                    filter(event, player) {
                        return event.cards?.length && !player.hasSkill('诱言_1', null, null, false);
                    },
                    content() {
                        player.addTempSkill('诱言_1', ['phaseZhunbeiAfter', 'phaseJudgeAfter', 'phaseDrawAfter', 'phaseUseAfter', 'phaseDiscardAfter', 'phaseJieshuAfter']);
                        var Q = [];
                        var list = [];
                        for (const i of trigger.cards) {
                            list.add(i.suit);
                        }
                        for (const i of lib.suits) {
                            if (list.includes(i)) {
                                continue;
                            }
                            var card = get.cardPile2(function (card) {
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
                //①当你使用牌指定目标后,你可将目标的一张牌置于你的武将牌上作为<嫕>.②与<嫕>花色相同的牌不占用你手牌上限且无距离次数限制.③每回合结束后或当你体力值变化后,你获得一张<嫕>
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
                        target: 'useCardToTargeted',
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
                        var target = trigger.player,
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
                                var Q = Math.ceil(player.getExpansions('埋祸_1').length / 2);
                                var E = Array.from(player.getExpansions('埋祸_1')).slice(0, Q);
                                player.loseToDiscardpile(E);
                                ('step 1');
                                var target = player.storage.埋祸_target;
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
                                var cards = player.getExpansions(skill);
                                if (cards.length) {
                                    player.loseToDiscardpile(cards);
                                }
                            },
                        },
                        2: {
                            trigger: {
                                player: 'useCardToTargeted',
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
                        global: 'gameStart',
                    },
                    forced: true,
                    audio: 'ext:缺德扩展/audio:1',
                    content() {
                        game.countPlayer(function (Q) {
                            if (Q != player && Q.isFriendsOf(player)) {
                                player.line(Q, 'purple');
                                Q.addSkill('比翼_1');
                                Q.addSkill('比翼_2');
                            }
                        });
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
                            content() {
                                var W = 0;
                                game.countPlayer(function (Q) {
                                    if (Q.hasSkill('比翼_1')) {
                                        W += Q.hp;
                                    }
                                });
                                var T = game.countPlayer(function (Q) {
                                    return Q.hasSkill('比翼_1');
                                });
                                game.countPlayer(function (Q) {
                                    if (Q.hasSkill('比翼_1')) {
                                        Q.hp = W / T;
                                    }
                                });
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
                                if (event.card.name == 'shan') {
                                    return false;
                                }
                                if (get.type(event.card) != 'basic' && get.type(event.card) != 'trick') {
                                    return false;
                                }
                                if (event.player == player) {
                                    return false;
                                }
                                if (!event.player.hasSkill('比翼_2')) {
                                    return false;
                                }
                                return true;
                            },
                            content() {
                                'step 0';
                                player.line(trigger.player, 'purple');
                                player.chooseToDiscard('hes', `弃置一张牌,令${get.translation(trigger.card)}结算两次`).set('ai', function (card) {
                                    var trigger = _status.event.getTrigger();
                                    if (trigger.card.name == 'tiesuo') {
                                        return 0;
                                    }
                                    var num = 0;
                                    for (const i of trigger.targets) {
                                        num += get.effect(i, trigger.card, trigger.player, _status.event.player);
                                    }
                                    if (num <= 0) {
                                        return 0;
                                    }
                                    return 7 - get.value(card);
                                }).logSkill = '比翼_2';
                                ('step 1');
                                if (result.bool) {
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
                        var cards = Array.from(ui.cardPile.childNodes).filter((q) => q.number == 7);
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
                                const { result: result2 } = await player
                                    .chooseToMove('将你的牌与东风交换')
                                    .set('list', [
                                        ['东风', player.getExpansions('QD_dongfeng')],
                                        ['你的牌', player.getCards('hej')],
                                    ])
                                    .set('filterMove', (from, to) => typeof to != 'number')
                                    .set('processAI', function (list) {
                                        var card = list[0][1].concat(list[1][1]);
                                        card.sort((a, b) => get.value(b) - get.value(a));
                                        var cardQ = [],
                                            num = list[1][1].length;
                                        while (num-- > 0) {
                                            cardQ.unshift(card.shift());
                                        }
                                        return [card, cardQ];
                                    });
                                if (result2.moved && result2.moved[0]) {
                                    player.addToExpansion(
                                        result2.moved[0].filter((q) => !player.getExpansions('QD_dongfeng').includes(q)),
                                        'draw'
                                    ).gaintag = ['QD_dongfeng'];
                                    player.gain(result2.moved[1], 'gain2');
                                    for (const i of result2.moved[1]) {
                                        if (!player.getCards('he').includes(i)) {
                                            player.node.handcards1.appendChild(i);
                                            ui.updatehl();
                                        }
                                    }
                                }
                                const { result } = await player.chooseTarget('大雾', (c, p, t) => !t.hasSkill('QD_dawu'), [1, game.players.length]).set('ai', (t) => get.attitude(player, t));
                                if (result.targets && result.targets[0]) {
                                    for (const i of result.targets) {
                                        i.addSkill('QD_dawu');
                                        player.loseToDiscardpile(player.getExpansions('QD_dongfeng').randomGet());
                                    }
                                }
                                const { result: result1 } = await player.chooseTarget('狂风', (c, p, t) => !t.hasSkill('QD_kuangfeng'), [1, game.players.length]).set('ai', (t) => -get.attitude(player, t));
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
                    trigger: {
                        player: ['damageBegin4'],
                    },
                    forced: true,
                    filter: (event, player) => !(Array.from(lib.nature.keys()).concat(undefined).randomGet() === event.nature),
                    async content(event, trigger, player) {
                        trigger.finished = true;
                    },
                },
                QD_kuangfeng: {
                    trigger: {
                        player: ['damageBefore'],
                    },
                    forced: true,
                    filter: (event, player) => event.nature,
                    async content(event, trigger, player) {
                        trigger.num = trigger.num * 2 || 2;
                    },
                },
                QD_jinfa: {
                    trigger: {
                        global: ['logSkillBegin'],
                    },
                    popup: false,
                    usable: 1,//silent发动的触发技不会logskill所以就没有round限制
                    filter(event, player) {
                        return event.player != player;
                    },
                    check: (event, player) => event.player.isEnemiesOf(player),
                    prompt(event, player) {
                        return `终止${get.translation(event.skill)}的发动`;
                    },
                    async content(event, trigger, player) {
                        const name = trigger.skill;
                        const info = lib.skill[name];
                        trigger.parent.next = trigger.parent.next.filter((q) => q.name != name);
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
                            const { result } = await player.chooseTarget(`是否发动【摧克】,对一名角色造成${num}点伤害`).set('ai', (target) => -get.attitude(player, target));
                            if (result.bool) {
                                result.targets[0].damage(num);
                            }
                        } else {
                            const { result } = await player.chooseTarget(`是否发动【摧克】,横置一名角色并弃置其区域内的${num || 1}张牌`).set('ai', (target) => -get.attitude(player, target));
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
                QD_dinghuo: {
                    audio: 'nzry_dinghuo',
                    limited: true,
                    intro: {
                        content: 'limited',
                    },
                    mark: true,
                    skillAnimation: true,
                    animationColor: 'metal',
                    enable: 'phaseUse',
                    filter(event, player) {
                        return player.countMark('QD_junlve') > 0;
                    },
                    check(event, player) {
                        return game.players.some((q) => q.isEnemiesOf(player) && q.isLinked() && q.countCards('e') > 1);
                    },
                    filterTarget(card, player, target) {
                        return target.isLinked();
                    },
                    selectTarget() {
                        return [1, _status.event.player.countMark('QD_junlve')];
                    },
                    multiline: true,
                    multitarget: true,
                    async content(event, trigger, player) {
                        //QQQ
                        player.awakenSkill('QD_dinghuo');
                        const num = player.countMark('QD_junlve');
                        for (const i of event.targets) {
                            i.discard(i.getCards('e'));
                        }
                        const { result } = await player.chooseTarget(true, `对一名目标角色造成${num}点火焰伤害`, function (card, player, target) {
                            return event.targets.includes(target);
                        });
                        if (result.bool) {
                            result.targets[0].damage(player.countMark('QD_junlve'), 'fire', 'nocard');
                            player.removeMark('QD_junlve', player.countMark('QD_junlve'));
                        }
                    },
                    ai: {
                        order: 1,
                        fireAttack: true,
                        result: {
                            target(player, target) {
                                if (target.hasSkillTag('nofire')) return 0;
                                return get.damageEffect(target, player) - target.countCards('e');
                            },
                        },
                    },
                },
                //绝情
                // 当你造成/受到伤害时,你可以弃置任意张牌,此伤害改为体力流失.若你弃置超过牌数大于对方体力值,你令此伤害+1/-1.<span class="Qmenu">锁定技,</span>当一名角色进入濒死状态时,若无伤害来源,你增加一点体力上限
                QD_jueqing: {
                    trigger: {
                        player: ['damageBefore'],
                        source: ['damageBefore'],
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        //QQQ
                        const { result: { cards } } = await player.chooseToDiscard('弃置任意张牌,此伤害改为体力流失', 'he', [1, player.countCards('he')]).set('ai', (card) => {
                            if (trigger.player == player) {
                                if (get.tag(card, 'recover')) return -1;
                                if (!player.isPhaseUsing() || (player.isPhaseUsing() && !player.hasValueTarget(card, null, true))) return 10;
                                return -1;
                            } else {
                                if (get.tag(card, 'recover')) return -1;
                                if (trigger.player.isFriendsOf(player) && (trigger.player.hasSkillTag('maihp') || trigger.player.hasSkillTag('maixie_defend') || trigger.player.hasSkillTag('maixie'))) {
                                    return -1;
                                }
                                if (trigger.player.isEnemiesOf(player) && (trigger.player.hasSkillTag('maihp') || trigger.player.hasSkillTag('maixie_defend') || trigger.player.hasSkillTag('maixie'))) {
                                    return 10;
                                }
                                if (!player.isPhaseUsing() || (player.isPhaseUsing() && !player.hasValueTarget(card, null, true))) return 10;
                                return -1;
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
                            if (card.cards?.some((q) => q.gaintag?.includes('QD_shangshi'))) {
                                return Infinity;
                            }
                        },
                        targetInRange(card, player) {
                            if (card.cards?.some((q) => q.gaintag?.includes('QD_shangshi'))) {
                                return true;
                            }
                        },
                    },
                    trigger: {
                        player: ['loseAfter', 'changeHp'],
                    },
                    forced: true,
                    filter: (event, player) => player.countCards('h') < numberq1(player.maxHp - player.hp),
                    async content(event, trigger, player) {
                        player.drawTo(numberq1(player.maxHp - player.hp)).gaintag = ['QD_shangshi'];
                    },
                    group: ['QD_shangshi_1'],
                    subSkill: {
                        1: {
                            trigger: {
                                player: ['useCardToBefore'],
                            },
                            forced: true,
                            filter(event, player) {
                                return event.cards?.some((card) => card.gaintag?.includes('QD_shangshi'));
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
                //准备阶段,你可以弃置一名角色至多X张牌,令一名角色摸剩余数量张牌
                QD_yinghun: {
                    trigger: {
                        global: ['roundStart'],
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        //QQQ
                        const { result } = await player.chooseTarget(`弃置一名角色至多${player.maxHp}张牌`, (c, p, t) => t.countCards('he'))
                            .set('ai', (target) => -get.attitude(player, target));
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
                会玩: {
                    audio: 'rezhiheng',
                    trigger: {
                        player: 'drawBefore',
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        var cards = ui.cardPile.childNodes;
                        var list = [];
                        for (var i = 0; i < cards.length; i++) {
                            list.push(cards[i]);
                        }
                        const { result: { links } } = await player.chooseButton(['请选择卡牌', list], true, trigger.num)
                            .set('ai', (button) => get.value(button.link));
                        if (links && links[0]) {
                            player.gain(links, 'drawpile');
                            trigger.cancel();
                        }
                    },
                    ai: {
                        order: 10,
                        result: {
                            player: 1,
                        },
                    },
                },
                //<出牌阶段外失去牌/出牌阶段内不因使用而失去牌>后,你可以获得其他角色的y张牌(y不大于2x),然后摸2x-y张牌(x为你失去牌的数量)
                QD_tuntian: {
                    audio: 'tuntian',
                    trigger: {
                        player: ['loseAfter'],
                    },
                    forced: true,
                    filter(event, player) {
                        if (player == _status.currentPhase && event.getParent('phaseUse', true)) {
                            return event.parent.name != 'useCard';
                        }
                        return true;
                    },
                    async content(event, trigger, player) {
                        var num = 2 * (trigger.cards.length);
                        const Q = [];
                        while (num > 0) {
                            const result = await player
                                .chooseTarget(`获得任意名角色区域内的至多${num}张牌`, (card, player, target) => {
                                    return (
                                        target != player &&
                                        target.hasCard((T) => {
                                            const G = _status.event.Q.find((item) => item[0] == target);
                                            if (G && G[1].includes(T)) {
                                                return false;
                                            }
                                            return lib.filter.canBeGained(T, player, target);
                                        }, 'hej')
                                    );
                                })
                                .set('ai', (target) => {
                                    const player = _status.event.player,
                                        G = _status.event.Q.find((item) => item[0] == target);
                                    if (G && G[1].length >= target.countCards('he')) {
                                        return 0;
                                    }
                                    return get.effect(target, { name: 'shunshou' }, player, player);
                                })
                                .set('Q', Q)
                                .forResult();
                            if (result.bool) {
                                const target = result.targets[0];
                                const cards = await player
                                    .choosePlayerCard(target, true, 'hej', [1, num], `选择获得${get.translation(target)}区域内的牌`)
                                    .set('filterButton', (button) => {
                                        const card = button.link,
                                            target = _status.event.target,
                                            player = get.player();
                                        const G = _status.event.Q.find((item) => item[0] == target);
                                        if (G && G[1].includes(card)) {
                                            return false;
                                        }
                                        return lib.filter.canBeGained(card, player, target);
                                    })
                                    .set('Q', Q)
                                    .set('ai', (button) => {
                                        if (ui.selected.buttons.length) {
                                            return false;
                                        }
                                        var val = get.buttonValue(button, _status.event.target);
                                        if (get.attitude(_status.event.player, _status.event.target) > 0) {
                                            return -val;
                                        }
                                        return val;
                                    })
                                    .forResultCards();
                                num -= cards.length;
                                const index = Q.find((item) => item[0] == target);
                                if (!index) {
                                    Q.push([target, cards]);
                                } else {
                                    index[1].addArray(cards);
                                }
                            } else {
                                break;
                            }
                        }
                        if (num > 0) {
                            player.draw(num);
                        }
                        if (Q.length) {
                            if (Q[0].length == 1) {
                                player.gain(Q[0][1], 'gain2');
                            } else {
                                for (const i of Q) {
                                    player.gain(i[1], 'gain2');
                                }
                            }
                        }
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————貂蝉
                //离间
                // 出牌阶段每名角色限一次,你可以弃置其一张牌,选择一名其他角色,令后者视为对前者使用一张【决斗】
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
                // 出牌阶段每名角色限一次,你可以选择一名角色,然后你弃置其一张手牌或将其一张装备牌置入你的装备区.若如此做,你摸一张牌并回复1点体力
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
                // 出牌阶段每名角色限一次,你可以观看并弃置其区域内的一张◆牌,然后你选择一项:1.视为对一名角色使用一张【乐不思蜀】;2.移动或弃置场上一张【乐不思蜀】.若如此做,你摸一张牌
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
                // 一名角色准备阶段,你进行一次判定并获得此牌,若结果不为红色,你重复此流程.锁定技,你的黑色牌不计入手牌上限和使用次数
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
                //傾國
                // 你可以将一张黑色牌当做【闪】使用或打出.当你需要使用或打出闪时,其他所有角色选择是否交给你一张黑色牌,你可以令没交给你牌的角色受到一点无来源火焰伤害或翻面
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
                                return player.filterCard('shan');
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
                //——————————————————————————————————————————————————————————————————————————————————————————————————黄月英
                //集智
                // 每回合每种牌名限一次,你可以将两张花色相同的非锦囊牌当任意普通锦囊牌使用;一名角色使用锦囊牌时,你摸一张牌,手牌上限+1
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
                //奇才
                // 锁定技,你使用锦囊牌无距离限制,你装备区内的牌不能因替换装备外失去
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
                //青囊
                // 出牌阶段每名角色限一次,你可以弃置其一张牌并令其失去或回复一点体力
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
                //——————————————————————————————————————————————————————————————————————————————————————————————————周瑜
                //英姿
                // 锁定技,你不因此技能获得牌时摸一张牌,每轮开始时,你可以令一名其他角色于本轮获得牌时随机少获得一张牌
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
                //反间
                // 出牌阶段每种花色限一次,你可以声明一个花色然后获得一名角色一张牌.若此牌花色与你声明的花色不同,其弃置与此牌花色相同的牌.若其因此弃置了牌,其失去1点体力
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
                //——————————————————————————————————————————————————————————————————————————————————————————————————黄盖
                //苦肉
                // 出牌阶段每名角色限一次,你可以弃置其一张牌令其失去1点体力
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
                //詐降
                // 锁定技,当场上一名角色失去1点体力后,你摸x张牌,增加1点护甲,使用【杀】的次数永久+1,本阶段使用【杀】无距离限制且不能被响应(X为<詐降>发动次数)
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
                // 出牌阶段限一次,你可以弃置一名角色任意张牌,然后摸等量的牌(若弃置了一个区域内的所有牌,则多摸一张牌)
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
                //救援
                // 主公技,当其他角色使用【桃】时,你可以令此牌目标改为你,然后你摸一张牌.锁定技,其他角色对你使用的【桃】回复的体力值+1.每回合限一次,当你需要使用【桃】时,你可以令任意其他角色代替你使用一张【桃】,否则该角色失去一点体力
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
                                return player.filterCard('tao') && player.identity == 'zhu';
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
                //——————————————————————————————————————————————————————————————————————————————————————————————————朱桓
                //奋励
                // 一名角色回合开始时时,若其的(手牌数/体力值/装备区里的牌数)为全场最大,你可以令其跳过(摸牌阶段/出牌阶段/弃牌阶段)
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
                // 锁定技,你不能被横置与翻面,不能成为延时锦囊牌或其他角色拼点的目标,你可以重铸装备牌
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
                // 锁定技,当你进入濒死状态时,你可以令一名角色展示牌堆顶一张牌,若此牌与其武将牌上的不屈牌点数均不同,你将此牌置于其武将牌上,然后将体力恢复至1.否则你获得所有不屈牌,然后其执行一次濒死结算,若其因此死亡,则终止你的濒死结算.你的手牌上限+全场不屈牌的数量
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
                // 当一张锦囊牌被使用时,你可以将任意名角色至多X张牌当作<谦逊>牌置于你的武将牌上.每回合结束时,你可以选择获得任意张<谦逊>牌(X为你<谦逊>牌数且至少为一)
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
                //連營
                // 锁定技,每当一个区域内失去最后一张牌时,你摸X张牌.当你一次性获得至少两张牌时,你可以分配其中的红色牌数点火焰伤害
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
                                    else {
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
                        return game.qcard(player, 'basic').filter((q) => !player.storage.QD_huomo.includes(q[2])).length && _status.currentPhase?.countCards('he');
                    },
                    hiddenCard(player, name) {
                        return lib.card[name].type == 'basic' && _status.currentPhase?.countCards('he') && !player.storage.QD_huomo.includes(name);
                    },
                    chooseButton: {
                        dialog(event, player) {
                            return ui.create.dialog('活墨', [game.qcard(player, 'basic').filter((q) => !player.storage.QD_huomo.includes(q[2])), 'vcard'], 'hidden');
                        },
                        check(button) {
                            const num = _status.event.player.getUseValue({
                                name: button.link[2],
                                nature: button.link[3],
                            }, null, true);
                            return number0(num) / 2 + 10;
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
                                    const { result: { links } } = await player.choosePlayerCard(_status.currentPhase, true, 'he', 'visible')
                                        .set('ai', (b) => sgn(_status.currentPhase.isEnemiesOf(player)) * get.value(b.link));
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
                        }
                    }
                },
                //佐定
                // 其他角色使用♠️牌指定目标后,若其本回合未造成过伤害,你可以将其区域内一张牌交给目标之一
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
                        const { result: { links } } = await player.choosePlayerCard(trigger.player, 'he', 'visible')
                            .set('ai', (b) => sgn(trigger.player.isEnemiesOf(player)) * get.value(b.link));
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
                //当一名角色<不因重铸或使用而>失去梅花牌时,你获得之.你的出牌阶段外,删除此技能括号内内容
                QD_luoying: {
                    trigger: {
                        global: ['loseAfter'],
                    },
                    filter(event, player) {
                        if ((event.getParent(2).name == 'recast' || event.parent.name == 'useCard') && _status.currentPhase == player && event.getParent('phaseUse', true)) {
                            return false;
                        }
                        return event.cards && event.cards.some((q) => q.suit == 'club');
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        player.gain(trigger.cards.filter((q) => q.suit == 'club'), 'gain2');
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
                        } = await player.chooseTarget('将一名正面朝上角色的武将牌翻面', (c, p, t) => !t.isTurnedOver(), true)
                            .set('ai', (t) => -get.attitude(player, t));
                        if (targets && targets[0]) {
                            targets[0].turnOver();
                        }
                    },
                    ai: {
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
                    prompt(event, player) {
                        return `摸四张牌,使用一张牌,令${get.translation(event.player)}翻面`;
                    },
                    async content(event, trigger, player) {
                        player.draw(4);
                        await player.chooseToUse((card) => lib.filter.filterCard(card, player, event.getParent(2)))
                            .set('ai1', (card, arg) => {
                                if (lib.card[card.name]) {
                                    return number0(player.getUseValue(card, null, true)) / 2 + 10;
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
                        } = await player.chooseTarget('将场上的牌当无懈可击使用', (c, p, t) => t.countCards('ej'), true)
                            .set('ai', (t) => -get.attitude(player, t));
                        if (targets && targets[0]) {
                            const { result: { links } } = await player.choosePlayerCard(targets[0], true, 'ej', 'visible')
                                .set('ai', (b) => sgn(targets[0].isEnemiesOf(player)) * get.value(b.link));
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
                    prompt(event, player) {
                        return `跳过${get.translation(event.name)},并令一名其他角色跳过其下个${get.translation(event.name)}`;
                    },
                    async content(event, trigger, player) {
                        trigger.cancel();
                        const {
                            result: { targets },
                        } = await player.chooseTarget(`令一名其他角色跳过其下个${get.translation(trigger.name)}`, (c, p, t) => p != t && !t.skipList.includes(trigger.name))
                            .set('ai', (t) => sgn(['phaseJudge', 'phaseDiscard'].includes(trigger.name)) * get.attitude(player, t));
                        if (targets && targets[0]) {
                            targets[0].skip(trigger.name);
                        }
                    },
                },
                // 设变
                // 当场上有人跳过阶段时,若此阶段为①摸牌阶段,你获得其他角色的至多两张牌②出牌阶段,你移动场上的一张牌
                // 然后你可以视为对一名其他角色使用一张杀
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
                                } = await player.chooseTarget('获得其他角色的至多两张牌', (c, p, t) => p != t && t.countCards('he'))
                                    .set('ai', (t) => -get.attitude(player, t));
                                if (targets && targets[0]) {
                                    const { result: { links } } = await player.choosePlayerCard(targets[0], true, 'he', [1, num], 'visible')
                                        .set('ai', (b) => get.value(b.link));
                                    if (links?.length) {
                                        num -= links.length;
                                        player.gain(links, 'gain2');
                                    }
                                    else {
                                        break;
                                    }
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        else if (trigger.name == 'phaseUse') {
                            await player.moveCard();
                        }
                        player.chooseUseTarget({ name: 'sha' }, true, false, 'nodistance');
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————荀攸
                //你可将所有黑色手牌当作任意一张普通锦囊牌使用,并摸一张牌
                QD_qice: {
                    hiddenCard: (player, name) => lib.card[name].type == 'trick' && player.countCards('h', { color: 'black' }),
                    enable: 'chooseToUse',
                    filter(event, player) {
                        return game.qcard(player, 'trick').length && player.hasCard({ color: 'black' }, 'h');
                    },
                    chooseButton: {
                        dialog(event, player) {
                            const list = game.qcard(player, 'trick');
                            return ui.create.dialog('奇策', [list, 'vcard'], 'hidden');
                        },
                        check(button) {
                            const num = _status.event.player.getUseValue({
                                name: button.link[2],
                                nature: button.link[3],
                            }, null, true);
                            if (button.link[2] == 'wuzhong') return 9999;
                            return number0(num) / 2 + 10;
                        },
                        backup(links, player) {
                            return {
                                audio: 'QD_qice',
                                popname: true,
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
                            if (player.countCards('h', { color: 'black' }) == 1) return 99;
                            return 1;
                        },
                        result: {
                            player: 1,
                        },
                    },
                },
                //——————————————————————————————————————————————————————————————————————————————————————————————————张让
                //滔乱
                //每阶段每种牌名限一次,你可以将一张牌当任意牌使用或打出,然后你选择一名角色令其选择①交给你一张牌②失去一点体力并随机失效一个技能
                QD_taoluan: {
                    init(player) {
                        player.storage.QD_taoluan = [];
                    },
                    enable: ['chooseToUse', 'chooseToRespond'],
                    hiddenCard(player, name) {
                        return player.countCards('hes') && !player.storage.QD_taoluan.includes(name);
                    },
                    filter: (event, player) => player.countCards('hes') && game.qcard(player).some((q) => !player.storage.QD_taoluan.includes(q[2])),
                    chooseButton: {
                        dialog(event, player) {
                            return ui.create.dialog('滔乱', [game.qcard(player).filter((q) => !player.storage.QD_taoluan.includes(q[2])), 'vcard']);
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
                            return number0(num) / 2 + 10;
                        },
                        backup(links, player) {
                            return {
                                filterCard: true,
                                selectCard: 1,
                                popname: true,
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
                        respondTao: true,
                        respondwuxie: true,
                        respondSha: true,
                        respondShan: true,
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
                            return `当前全场角色累计失去过的牌包含${game.lose().map((q) => q.suit).unique().length}种花色`;
                        },
                    },
                    trigger: {
                        global: ['phaseAfter'],
                    },
                    forced: true,
                    filter(event, player) {
                        return game.lose().map((q) => q.suit).unique().length > 3;
                    },
                    async content(event, trigger, player) {
                        player.phase();
                    },
                },
                //攻心                
                // 每回合限一次,当你<使用牌指定其他角色为目标/成为其他角色使用牌的目标>时,你观看对方牌并获得每种花色各一张
                QD_gongxin: {
                    usable: 1,
                    trigger: {
                        player: ['useCardToPlayer'],
                        target: ['useCardToPlayer'],
                    },
                    forced: true,
                    filter(event, player) {
                        if (event.player == player) {
                            return event.target != player && event.target.countCards('he');
                        }
                        return event.player.countCards('he');
                    },
                    async content(event, trigger, player) {
                        const target = (trigger.player == player) ? trigger.target : trigger.player;
                        const { result: { links } } = await player.choosePlayerCard(target, 'he', [1, 5], 'visible')
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
                //——————————————————————————————————————————————————————————————————————————————————————————————————姜维
                // 挑衅
                // 出牌阶段限一次,你可以令一名其他角色对其自己使用一张【杀】,否则你获得其一张牌
                // 志继
                // 觉醒技,一名角色回合开始时,若其没有手牌,其减一点体力上限.你增加一点体力上限,摸两张牌,恢复一点体力,从任意个诸葛亮中选择一个技能获得
                //——————————————————————————————————————————————————————————————————————————————————————————————————司马懿
                //反饋
                // 一名角色受到一点伤害后,你可以获得一名角色一张牌
                //鬼才
                // 当一名角色的判定牌生效前,你可以选择牌堆顶X张牌(X为此判定牌点数)或场上或你区域内的一张牌代替之
                //——————————————————————————————————————————————————————————————————————————————————————————————————华雄
                //耀武
                // 锁定技,当你受到牌造成的伤害时,若此牌为红色,则伤害来源弃两张牌,否则你选择一项:1.摸两张牌;2.回复一点体力;3.摸一张牌并增加一点体力上限
                //势斬
                // 出牌阶段每名角色限两次,你可以弃置其一张牌并视为对其使用一张【决斗】.当你以此法造成或受到伤害后,你可以减少一点体力上限并摸X张牌(X为<势斩>发动次数).若如此做,你的回合结束时,你将<势斩>发动时机改为<一名角色回合开始或结束时>,直至你下个回合开始
                //——————————————————————————————————————————————————————————————————————————————————————————————————夏侯惇
                //剛烈
                // 每当你受到一点伤害后,你可以进行一次判定,若结果为:红色,你回复一点体力并令一名角色受到来源为你的一点伤害;黑色,你摸一张牌并获得一名角色一张牌,若其没有手牌,其翻面
                //清儉
                // 当你于摸牌阶段外获得牌后,你可以展示一名角色任意张牌并交给另一名角色,然后以此法获得牌的角色下个回合手牌上限+X(X为以次法获得的牌数),若其当前处于其回合,则改为这个回合
                //——————————————————————————————————————————————————————————————————————————————————————————————————郭嘉
                //天妒
                // 当一名角色的判定牌生效后,你可以获得之,若此牌是:基本牌,你将体力回复至体力上限;锦囊牌,你摸X张牌(X为此牌点数);装备牌,你对所有角色各造成等同于你体力值的雷电伤害
                //遗計
                // 一名角色扣减体力后,你可以摸两张牌.若你脱离过濒死状态,你使用牌无次数限制
                //——————————————————————————————————————————————————————————————————————————————————————————————————甘宁
                //奇襲
                // 当一名角色:获得牌时,你可以展示之并弃置其中黑色牌;出牌阶段开始时,你可以展示一名角色所有手牌,你可以弃置其中任意张黑色牌和等量张红色牌;弃牌阶段开始时,你可以获得其所有手牌
                //奮威
                // 当一张牌指定至少两个目标后,你可以令此牌对其中至多X名目标角色无效(X我当前回合<奇袭>发动的次数)
                //——————————————————————————————————————————————————————————————————————————————————————————————————赵云
                //龍膽
                // 当你需要使用或打出【杀】或【闪】时,你可以观看场上所有角色的所有手牌,然后你可以将其中任意张【杀】当一张【闪】、任意张【闪】当一张【杀】使用或打出
                //涯角
                // 当你于回合外使用或打出手牌时,你可以令其他所有角色展示牌堆顶的一张牌并将之交你,然后若这些牌类别均不同,你弃置所有牌,否则你弃置其他所有角色各一张牌
                //——————————————————————————————————————————————————————————————————————————————————————————————————张飞
                //咆哮
                // 锁定技,你使用【杀】无次数限制.若你于出牌阶段内使用过【杀】,你本阶段使用【杀】无距离限制.当你使用【杀】被抵消后,你获得抵消此【杀】的牌,你本回合下一次使用【杀】伤害+X(X为本轮<咆哮>发动次数)
                //替身
                // 当一名其他角色使用一张目标有你的牌对你结算完成后,你可以弃置其一张牌,若此牌是:装备牌,你获得对你结算完成的牌并摸一张牌:基本牌,你回复一点体力;锦囊牌,你可以对一名角色结算一次与你被指定为目标的牌相同的效果
                //——————————————————————————————————————————————————————————————————————————————————————————————————吕布
                //無雙
                // 锁定技,当你使用牌每指定一名角色为目标后,其需使用X张相对应的牌才能响应或抵消此牌(X为此牌指定目标数+1)
                //利馭
                // 当你使用牌对其他角色造成伤害后,你可以获得其一张牌,若其:有牌,其需弃一张牌,否则视为你对一名角色使用一张【决斗】;无牌,你摸Y张牌(Y为本轮<无双>发动次数)
                //——————————————————————————————————————————————————————————————————————————————————————————————————曹操
                //奸雄
                // 每当场上一名角色受到一点伤害后,你可以获得造成伤害的牌并摸一张牌(以此法获得的牌若是伤害类锦囊牌,你记录此牌牌名,每轮每名角色只能使用一次与之相同牌名的牌),若此角色为你,你可以对伤害来源造成一点伤害
                //護駕
                // 主公技,当你需要使用或打出【闪】时,你可以令所有其他魏势力角色依次选择是否打出一张【闪】,若有角色打出【闪】,视为你使用或打出一张【闪】,没打出【闪】的角色受到一点伤害
                //——————————————————————————————————————————————————————————————————————————————————————————————————许褚
                //裸衣
                // 当一名角色:摸牌阶段开始时,你可以令其本回合摸牌阶段改为亮出牌堆顶的三张牌,然后你可以获得其中的基本牌、武器牌或【决斗】,其获得剩余的牌,本轮你使用【杀】或【决斗】对其他角色造成的伤害+X(X为本轮<裸衣>发动的次数);回合结束时,你可以对其使用一张【杀】或【决斗】
                //——————————————————————————————————————————————————————————————————————————————————————————————————关羽
                //武型
                // 当你需要使用或打出一张【杀】时,你可以观看场上所有角色的所有牌,你可以将其中的任意张◆牌当一张【杀】使用或打出.你使用的◆【杀】无距离限制
                //義絶
                // 出牌阶段限一次,你可以摸一张牌,令一名其他角色展示一张手牌.若此牌为红色,你获得此牌且你可以回复1点体力或令其失去一点体力;若此牌为黑色,本回合:其所有非锁定技失效且不能使用或打出手牌、你使用◆【杀】对其造成的伤害+1
                //——————————————————————————————————————————————————————————————————————————————————————————————————马超
                //馬術
                // 锁定技,你计算与其他角色的距离-1,其他角色与你的距离+1
                //騎
                // 当你使用【杀】指定一名角色为目标后,你可以令其本回合所有非锁定技失效,然后你可以选择一项:1.弃置或获得其至多两张牌:2.进行一次判定,若结果为:红色,此【杀】不可响应且不计入次数;黑色,此【杀】伤害+1且可以多指定一名除此名角色以外的一名其他角色为目标:3.此【杀】结算次数+1
            };
            for (const i in skill) {
                const info = skill[i];
                info.nobracket = true;
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
                //——————————————————————————————————————————————————————————————————————————————————————————————————钟琰
                QD_zhongyan: '钟琰',
                QD_bolan: '博览',
                QD_bolan_info: '任意回合开始时,你随机获得阴间技能池中一个技能(覆盖之前获得的)',
                //——————————————————————————————————————————————————————————————————————————————————————————————————吕蒙
                QD_lvmeng: '吕蒙',
                QD_keji: '克己',
                QD_keji_info: '一名角色弃牌阶段结束时,你摸其弃牌数两倍的牌',
                QD_botu: '博圖',
                QD_botu_info: '当一名角色回合结束时,若此回合全场角色累计失去过的牌包含四种花色,你可以立即执行一个额外的回合',
                QD_gongxin: '攻心',
                QD_gongxin_info: '每回合限一次,当你<使用牌指定其他角色为目标/成为其他角色使用牌的目标>时,你观看对方牌并获得每种花色各一张',
                //——————————————————————————————————————————————————————————————————————————————————————————————————张让
                QD_zhangrang: '张让',
                QD_taoluan: '滔乱',
                QD_taoluan_info: '每阶段每种牌名限一次,你可以将一张牌当任意牌使用或打出,然后你选择一名角色令其选择①交给你一张牌②失去一点体力并随机失效一个技能',
                //——————————————————————————————————————————————————————————————————————————————————————————————————荀攸
                QD_xunyou: '荀攸',
                QD_qice: '奇策',
                QD_qice_info: '你可将所有黑色手牌当作任意一张普通锦囊牌使用,并摸一张牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————夏侯渊
                QD_xiahouyuan: '夏侯渊',
                QD_shensu: '神速',
                QD_shensu_info: '你的阶段开始时,可以跳过之,并令一名其他角色跳过其下个相同的阶段',
                QD_shebian: '设变',
                QD_shebian_info: '当场上有人跳过阶段时,若此阶段为①摸牌阶段,你获得其他角色的至多两张牌②出牌阶段,你移动场上的一张牌<br>然后你可以视为对一名其他角色使用一张杀',
                //——————————————————————————————————————————————————————————————————————————————————————————————————曹仁
                QD_caoren: '曹仁',
                QD_jushou: '据守',
                QD_jushou_info: '一名角色结束阶段,你可以摸四张牌,使用一张牌,令其翻面',
                QD_jiewei: '解围',
                QD_jiewei_info: '你可以将场上的牌当无懈可击使用',
                //——————————————————————————————————————————————————————————————————————————————————————————————————曹植
                QD_caozhi: '曹植',
                QD_luoying: '落英',
                QD_luoying_info: '<span class="Qmenu">锁定技,</span>当一名角色<不因重铸或使用而>失去梅花牌时,你获得之.你的出牌阶段外,删除此技能括号内内容',
                QD_jiushi: '酒诗',
                QD_jiushi_info: '你可以将一名正面朝上角色的武将牌翻面,视为使用一张酒',
                //——————————————————————————————————————————————————————————————————————————————————————————————————曹真
                QD_caozhen: '曹真',
                QD_sidi: '司敌',
                QD_sidi_info: '一名角色出牌阶段开始时,你可以将其一张牌当做<杀>对其使用,令其本回合不可使用或打出与此牌颜色相同的牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————钟繇
                QD_zhongyao: '钟繇',
                QD_huomo: '活墨',
                QD_huomo_info: '你可以将当前回合角色区域内一张牌置于牌堆顶,视为使用一张本回合未以此法使用过的基本牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————蛊惑
                QD_蛊惑: '蛊惑',
                蛊惑: '蛊惑',
                蛊惑_info: '出牌阶段限一次,你可以将牌堆底一张牌扣置当任意一张基本牌或普通锦囊牌使用或打出.其他所有角色依次选择是否质疑,有人质疑则翻开此牌:若此牌与你声明的牌相同,质疑者获得一个<惑>标记;反之则此牌作废,你本回合对质疑者使用牌无距离次数限制,每有一个质疑者,你增加一次蛊惑次数;拥有<惑>标记的角色不可质疑你的惑论.每回合结束时你可以移除惑标记,然后视为使用移除的标记数张任意牌',
                煽火: '煽火',
                煽火_info: '每轮限一次,当一名角色受到伤害后,你可以发起一次议事,若结果为红色,伤害来源需交给受伤者X张牌(X为受伤者已损失的体力值)并失去一点体力;若结果为黑色,伤害来源需选择一项:1.不能使用或打出手牌直到本轮结束:2.将武将牌翻至背面:若受伤者为你,则你发动此技能无次数限制.<span class="Qmenu">锁定技,</span>当场上有<惑>的角色数不小于未拥有<惑>角色时,你[议事/拼点!时「拥有<惑>的角色的意见视为与你相同/此牌点数+31',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————董卓
                QD_董卓: '董卓',
                QD_暴虐: '暴虐',
                QD_暴虐_info: '<span class="Qmenu">锁定技,</span>其他角色造成1点伤害后,你进行判定,若为♠,你回复1点体力并获得判定牌',
                QD_roulin: '肉林',
                QD_roulin_info: '<span class="Qmenu">锁定技,</span>当一名角色不因重铸或使用而失去黑桃牌时,你获得之',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————神赵云
                QD_神赵云: '神赵云',
                冲阵: '冲阵',
                冲阵_info:
                    '你可以将一张牌的花色按以下规则使用或打出:红桃当【桃】;方块当火【杀】;梅花当【闪】;黑桃当【无懈可击】.\
        当你以此法使用或打出【杀】或【闪】时,你可以获得对方一张牌;当你以此法使用【桃】时,你可以获得一名其他角色的一张牌;当你以此法使用【无懈可击】时,你可以获得你响应普通锦囊牌使用者的一张牌',
                绝境: '绝境',
                绝境_info: '<span class="Qmenu">锁定技,</span>你的手牌上限+5;当你进入或脱离濒死状态时,你摸2张牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————冯方女
                QD_冯方女: '冯方女',
                琼梳: '琼梳',
                琼梳_info: '当你受到伤害时,你弃置X张牌并防止此伤害(X为伤害值)',
                金梳: '金梳',
                金梳_info: '<span class="Qmenu">锁定技,</span>出牌阶段结束时,你将手牌摸至体力上限',
                犀梳: '犀梳',
                犀梳_info: '<span class="Qmenu">锁定技,</span>跳过判定和弃牌阶段',
                妆梳: '妆梳',
                妆梳_info: '一名角色的回合开始时,你可以弃置一张牌,将一张<宝梳>置入其宝物区(牌的类别决定<宝梳>种类)',
                垂涕: '垂涕',
                垂涕_info: '当牌因弃置而置入弃牌堆后,若你能使用此牌,你可以使用之',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————曹宪曹华
                QD_曹宪曹华: '曹宪曹华',
                鸣: '鸣',
                鸣_info: '出牌阶段你可随机弃置六张牌,并随机从牌堆中获得三张锦囊牌',
                化木: '化木',
                化木_info: '<span class="Qmenu">锁定技,</span>当你使用手牌后,你将此牌置于你的武将牌上,黑色牌称为<灵杉>,红色牌称为<玉树>',
                良缘: '良缘',
                良缘_info: '你可以将场上一张<灵杉>/<玉树>当<酒>/<桃>使用',
                前盟: '前盟',
                前盟_info: '<span class="Qmenu">锁定技,</span>当<灵杉>或<玉树>数量变化后,你摸一张牌',
                羁肆: '羁肆',
                羁肆_info: '限定技,准备阶段,你可以令一名其他角色获得前盟',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————李典
                QD_李典: '李典',
                恂恂: '恂恂',
                恂恂_info: '<span class="Qmenu">锁定技,</span>当你体力值变化后、准备阶段、造成伤害后,你观看牌堆顶五张牌获得其中两张,其余牌置入牌堆底',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————杨艳
                QD_杨艳: '杨艳',
                娴婉: '娴婉',
                娴婉_info: '你可以横置一名角色,视为使用一张基本牌.你可以重置一名角色,视为使用一张锦囊牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————神司马
                QD_神司马: '神司马',
                忍戒: '忍戒',
                忍戒_info: '<span class="Qmenu">锁定技,</span>当你改变体力值或出牌阶段外失去牌时,你获得等量的忍.当你的忍大于3,你获得<极略>,然后增加一点体力上限,恢复两点体力,摸两张牌',
                极略: '极略',
                极略_info:
                    '当一名角色的判定牌生效前,你可以弃1枚<忍>标记并发动〖鬼才〗;每当你受到伤害后,你可以弃1枚<忍>标记并发动〖放逐〗;出牌阶段,你可以弃1枚<忍>标记并发动〖制衡〗;\
        出牌阶段,你可以弃1枚<忍>标记并获得〖完杀〗直到回合结束',
                极略_zhiheng: '制衡',
                极略_zhiheng_info: '你可以弃置一个忍发动一次制衡,无次数限制',
                极略_wansha: '完杀',
                极略_wansha_info: '<span class="Qmenu">锁定技,</span>完杀',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————黄盖
                QD_黄盖: '黄盖',
                QD_黄盖0: '黄盖0',
                QD_黄盖1: '黄盖1',
                QD_kuroux: '苦肉',
                QD_kuroux_info: '出牌阶段你可以失去一点体力增加一个回合',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————神吕蒙
                QD_神吕蒙: '神吕蒙',
                涉猎: '涉猎',
                涉猎_info: '<span class="Qmenu">锁定技,</span>摸牌阶段,你改为获得牌堆中每种花色的牌各一张',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————钟会
                QD_钟会: '钟会',
                权计: '权计',
                权计_info: '①<span class="Qmenu">锁定技,</span>当你体力值变化/出牌阶段内不因使用失去牌/出牌阶段外失去牌时,你摸一张牌,将一张牌称为<权>置于武将牌上②你的手牌上限+X(X为<权>数)',
                排异: '排异',
                排异_info: '出牌阶段每项限一次,你可移去一张<权>并选择一项:①摸X张牌②对敌方角色各造成1点伤害(X为<权>数)',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————严颜
                QD_严颜: '严颜',
                拒战: '拒战',
                拒战_info: '<span class="Qmenu">锁定技,</span>当你成为其他角色牌的目标后,你与其各摸一张牌,然后其本回合内不能再对你使用牌.当你使用牌指定一名角色为目标后,你获得其一张牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————司马师
                QD_司马师: '司马师',
                夷灭: '夷灭',
                夷灭_info: '<span class="Qmenu">锁定技,</span>当你对其他角色造成伤害时,你将伤害值改为Y(Y为其体力值)',
                泰然: '泰然',
                泰然_info: '<span class="Qmenu">锁定技,</span>回合结束时,你将体力回复至体力上限,并将手牌摸至体力上限',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————徐荣
                QD_徐荣: '徐荣',
                凶镬: '凶镬',
                凶镬_info:
                    '1、游戏开始时,你获得3个<暴戾>标记(你对有此标记的其他角色造成的伤害+x,x为其拥有的此标记数);2、出牌阶段,你可以交给一名其他角色1个<暴戾>标记;\
        3、有<暴戾>标记的其他角色的出牌阶段开始时,其随机执行x次以下三项:1.受到1点火焰伤害且本回合不能对你使用【杀】;2.失去1点体力且手牌上限-1;3.令你随机获得其一张手牌和一张装备区里的牌',
                不能出杀: '不能出杀',
                不能出杀_info: '<span class="Qmenu">锁定技,</span>不能出杀',
                减手牌上限: '减手牌上限',
                减手牌上限_info: '<span class="Qmenu">锁定技,</span>减手牌上限',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————族吴苋
                QD_族吴苋: '族吴苋',
                贵相: '贵相',
                贵相_info: '<span class="Qmenu">锁定技,</span>你的准备阶段、判定阶段、摸牌阶段、弃牌阶段、结束阶段全部改为出牌阶段',
                移荣: '移荣',
                移荣_info: '出牌阶段你可以将手牌摸到手牌上限,然后令手牌上限加一,回合结束时,你令手牌上限减4',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————神吕布
                QD_神吕布: '神吕布',
                神威: '神威',
                神威_info: '<span class="Qmenu">锁定技,</span>摸牌阶段,你额外摸X张牌,你的手牌上限+X(X为场上其他角色的数目)',
                修罗炼狱戟: '修罗炼狱戟',
                修罗炼狱戟_info: '<span class="Qmenu">锁定技,</span>你使用的正收益牌指定所有友方角色为目标,负收益牌指定所有敌方角色为目标;你造成伤害前令伤害增加x/3,造成伤害后令目标恢复y/4点体力,x为目标体力值与体力上限中的最大值,y为最小值',
                玲珑: '玲珑',
                玲珑_info: '<span class="Qmenu">锁定技,</span>负收益的牌指定你为目标时,你进行一次判定,若结果是红色,则此牌对你无效',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————沮授
                QD_沮授: '沮授',
                矢北: '矢北',
                矢北_info: '<span class="Qmenu">锁定技,</span>每轮你首次受到伤害后恢复13点体力,每回合受到的伤害改为x.(x为本回合受伤次数)',
                渐营: '渐营',
                渐营_info: '<span class="Qmenu">锁定技,</span>记录你每轮使用的第一张牌的点数(不覆盖上次记录),当你使用或打出与记录点数相同的牌时,你摸一张牌或弃置其他角色一张牌',
                释怀: '释怀',
                释怀_info: '<span class="Qmenu">锁定技,</span>你获得所有装备过的装备牌对应的技能',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————兀突骨
                QD_兀突骨: '兀突骨',
                QD_ranshang: '燃殤',
                QD_ranshang_info: '<span class="Qmenu">锁定技,</span>当你受到火属性伤害时,伤害翻倍且获得等同于伤害数量<燃>.你的结束阶段受到<燃>标记数点火属性伤害.多目标牌和普通杀对你无效,当游戏轮数大于10时,你所在阵营获胜',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————贾诩
                QD_贾诩: '贾诩',
                QD_luanwu: '乱武',
                QD_luanwu_info: '回合限一次,你可令所有角色依次选择视为使用一张无距离限制的杀或者伤害锦囊,若存在其他角色在<乱武>之后体力值未减少,则再发动一次<乱武>',
                QD_weimu: '帷幕',
                QD_weimu_info: '<span class="Qmenu">锁定技,</span>由你自己作为来源或回合内体力值与体力上限变化后,你摸变化值两倍的牌,然后免疫之.你不能成为黑色牌的目标',
                QD_wansha: '完杀',
                QD_wansha_info: '<span class="Qmenu">锁定技,</span>一名角色体力值每累计变化两次后,你视为对其使用一张杀.你对体力值不大于你的角色造成的伤害翻倍',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————王异
                QD_王异: '王异',
                贞烈: '贞烈',
                贞烈_info: '当你成为负收益的牌的目标时,你失去一点体力,并可以选择获得场上角色至多x张手牌,若你获得的牌不足x张则摸不足的牌数,x为你已损体力值',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————蔡文姬
                QD_wenji: '蔡文姬',
                QD_shuangjia: '霜笳',
                QD_shuangjia_info: '<span class="Qmenu">锁定技,</span>①游戏开始,你将牌堆顶四张牌标记为<霜笳>.②你的<霜笳>牌不计入手牌上限.③其他角色至你的距离+<霜笳>数.①当你失去牌后,若这些牌中有<霜笳>牌,你获得与此牌花色均不同牌各一张.②你使用牌无距离和次数限制③每回合开始时你获得所有<霜笳>牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————董白
                QD_董白: '董白',
                连诛: '连诛',
                连诛_info: '准备阶段开始时,或当你受到伤害后,你可将一张牌交给一名其他角色并获得如下效果:摸牌阶段的额定摸牌数+1,使用【杀】的次数上限+1,手牌上限+1',
                黠慧: '黠慧',
                黠慧_info: '<span class="Qmenu">锁定技,</span>你的黑色牌不计入手牌上限;其他角色获得你的黑色牌时,其不能使用、打出、弃置这些牌',
                黠慧_2: '黠慧',
                黠慧_2_info: '<span class="Qmenu">锁定技,</span>不能使用、打出或弃置获得的黑色牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————诸葛亮
                QD_诸葛亮: '诸葛亮',
                QD_guanxing: '观星',
                QD_guanxing_info: '<span class="Qmenu">锁定技,</span>每回合开始时,观看牌堆顶七张牌,并任意将这些牌置于牌堆顶或牌堆底',
                QD_guanxing1: '观星',
                QD_guanxing1_info: '<span class="Qmenu">锁定技,</span>准备阶段开始时,观看牌堆顶七张牌,并任意将这些牌置于牌堆顶或牌堆底',
                QD_kongcheng: '空城',
                QD_kongcheng_info: '<span class="Qmenu">锁定技,</span>①若你手牌只有一种类型,你不能成为伤害牌的目标②回合结束时,若你手牌只有一种类型,则取消①中的条件直至你回合开始',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————橘子
                QD_橘子: '橘子',
                给橘: '给橘',
                给橘_info: '出牌阶段开始时,你可以失去1点体力或移去1个<橘>,令一名其他角色获得2个<橘>',
                橘: '橘',
                橘_info: '<span class="Qmenu">锁定技,</span>游戏开始时,你获得6个<橘>;有<橘>的角色摸牌阶段多摸2张牌;摸牌阶段开始前,你获得2个<橘>.当有<橘>的角色受到伤害时,防止此伤害,然后其移去1个<橘>',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————张角
                QD_张角: '张角',
                QD_leiji: '雷击',
                QD_leiji_info: '<span class="Qmenu">锁定技,</span>当一名角色回合外使用或打出牌时,你进行一次判定<br>当一名角色判定结束后,若结果为:♠️,你对一名角色造成2点雷电伤害;♣️,你回复1点体力并对一名角色造成1点雷电伤害',
                鬼道: '鬼道',
                鬼道_info: '当一名角色的判定牌生效前,你可以打出一张牌替换之,然后你摸一张牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————周瑜
                QD_周瑜: '周瑜',
                反间: '反间',
                反间_info: '无限反间',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————袁术
                QD_袁术: '袁术',
                QD_wangzun: '妄尊',
                QD_wangzun_info: '<span class="Qmenu">锁定技,</span>其他角色准备阶段你可以摸一张牌,然后其本回合只能对你使用牌,且手牌上限减三',
                QD_wangzun_1: '被妄尊',
                QD_wangzun_1_info: '本回合只能对妄尊技能持有者使用牌,且手牌上限减三',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————曹仁
                QD_曹仁: '曹仁',
                据守: '据守',
                据守_info: '<span class="Qmenu">锁定技,</span>弃牌阶段开始时,你翻面并弃置所有手牌并获得等量的<护甲>;当你受到伤害后,若你的武将牌背面朝上,你获得1点<护甲>;当你的武将牌从背面翻至正面时,你摸等同于你<护甲>值的牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————薛综
                QD_薛综: '薛综',
                安国: '安国',
                安国_info: '出牌阶段限2次,你可以选择一名其他角色,你与其各摸一张牌,回复1点体力,随机使用一张装备牌',
                复难: '复难',
                复难_info: '其他角色使用或打出牌响应你使用的牌时,你可获得其使用或打出的牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————曹昂
                QD_曹昂: '曹昂',
                慷忾: '慷忾',
                慷忾_info: '当一名角色成为牌的目标时(使用者不能是其自身),你可以摸两张牌并交给其一张牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————法正
                QD_法正: '法正',
                恩怨: '恩怨',
                恩怨_info: '当你体力值变化后、准备阶段、造成伤害后,你可以获得一名角色一张牌并令其失去一点体力,然后你摸一张牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————张辽
                QD_张辽: '张辽',
                突袭: '突袭',
                突袭_info: '当你摸牌时,你可以少摸任意张牌,并获得其他角色等量张牌',
                镇卫: '镇卫',
                镇卫_info: '当其他角色成为单一目标牌的目标时(使用者不能是其自身和你),你可以将目标转移给你并摸一张牌,也可以将此牌置于使用者武将牌上,此牌失效,使用者回合结束后获得此牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————孙登
                QD_孙登: '孙登',
                诓人: '诓人',
                诓人_info: '出牌阶段你可选择一名角色将其所有牌放于你武将牌上,你与其在你下个准备阶段摸武将牌上数量的牌,并移去武将牌上的牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————藤芳兰
                QD_藤芳兰: '藤芳兰',
                落宠: '落宠',
                落宠_info: '准备阶段、你体力值改变、造成伤害时,你可以令一名角色:回复一点体力、弃置两张牌、摸两张牌、失去一点体力',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————制衡
                QD_制衡: '制衡',
                制衡: '制衡',
                制衡_info: '准备阶段、你体力值改变、造成伤害时,你可以发动制衡或增加出牌阶段内发动制衡的次数',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————大乔
                QD_大乔: '大乔',
                国色: '国色',
                国色_info: '出牌阶段,你可弃置一张方块牌赋予一名角色不动白标记并摸一张牌',
                不动白: '不动白',
                不动白_info: '<span class="Qmenu">锁定技,</span>你跳过出牌阶段',
                流离: '流离',
                流离_info: '当你成为其他角色牌的目标时,你可以弃置一张牌将此牌转移给其他角色',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————徐晃
                QD_徐晃: '徐晃',
                断粮: '断粮',
                断粮_info: '出牌阶段,你可弃置一张黑色牌并赋予一名角色摸牌白标记',
                摸牌白: '摸牌白',
                摸牌白_info: '<span class="Qmenu">锁定技,</span>你跳过摸牌阶段',
                截辎: '截辎',
                截辎_info: '<span class="Qmenu">锁定技,</span>当有人跳过摸牌阶段后,你摸两张牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————神周瑜
                QD_神周瑜: '神周瑜',
                琴音: '琴音',
                琴音_info: '<span class="Qmenu">锁定技,</span>回合结束时,你令所有友方角色回复一点体力,令所有敌方角色失去一点体力',
                业炎: '业炎',
                业炎_info: '出牌阶段,你可以分配3点火焰伤害给任意角色',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————夏侯渊
                QD_夏侯渊: '夏侯渊',
                奇兵: '奇兵',
                奇兵_info: '一名角色的结束阶段结束时,你摸一张牌,然后可以使用一张牌,此牌无距离限制',
                夺锐属性: '夺锐属性',
                夺锐属性_info: '当你每回合第一次使用牌指定其他角色为目标时,你随机夺取他的一个属性(体力上限、摸牌阶段摸牌数、攻击范围、出牌阶段使用杀的次数、手牌上限)',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————阎圃
                QD_阎圃: '阎圃',
                缓图: '缓图',
                缓图_info: '当一名角色摸牌阶段开始时,你可以令其摸两张牌并跳过此摸牌阶段',
                缓图_1: '缓图1',
                缓图_1_info: '当一名角色出牌阶段开始时,你可以令其视为使用一张杀并跳过此出牌阶段',
                缓图_2: '缓图2',
                缓图_2_info: ' 当一名角色弃牌阶段开始时,你可以令其弃置两张牌并跳过此弃牌阶段',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————左慈
                QD_左慈: '左慈',
                QD_huanshen: '幻身',
                QD_huanshen_info: '①游戏开始时,你随机获得两张未加入游戏的武将牌(称为<幻身>),第一个<幻身>固定为孙策.回合开始与结束时,你弃置任意张<幻身>并获得双倍<幻身>,每弃置一张<幻身>,增加一点体力上限和3点护甲,并获得一张<幻身>上的所有技能.你每次受到和造成伤害时,获得伤害值2倍的<幻身>',
                QD_xianshu: '仙术',
                QD_xianshu_info: '<span class="Qmenu">锁定技,</span>当你进入濒死时,随机使用牌堆中和场上的<桃>与<酒>',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————杨婉
                QD_杨婉: '杨婉',
                诱言: '诱言',
                诱言_info: '<span class="Qmenu">锁定技,</span>每个阶段限一次,当你失去牌时,你获得和失去牌花色不同的牌各一张',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————杨芷
                QD_杨芷: '杨芷',
                QD_wanyi: '婉嫕',
                QD_wanyi_info: '<span class="Qmenu">锁定技,</span>①当你使用牌指定目标后,你将目标的一张牌置于你的武将牌上作为<嫕>.②与<嫕>花色相同的牌不占用你手牌上限且无距离次数限制.③每回合结束后或当你体力值变化后,你获得一张<嫕>',
                埋祸: '埋祸',
                埋祸_info:
                    '<span class="Qmenu">锁定技,</span>其他角色对你使用牌时,你可以将此牌置于其武将牌上称为<祸>并令其失效.当你对其他角色使用牌时,移去其武将牌上的一张<祸>.\
        其他角色出牌阶段开始时,随机失去一半的<祸>(向上取整),然后对你使用剩余的<祸>',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————宣公主
                QD_宣公主: '宣公主',
                比翼: '比翼',
                比翼_info: '<span class="Qmenu">锁定技,</span>游戏开始时你选中另一名角色,你与其共享且永远平分体力值,任一人体力值变化后,你与其摸已损体力值张牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————东风诸葛
                QD_zhuge: '东风诸葛',
                QD_jinfa: '禁法',
                QD_jinfa_info: '每轮限一次,你可以终止一个触发技的发动',
                QD_dongfeng: '东风',
                QD_dongfeng_info: '游戏开始时,你将所有七点数牌当作<东风>置于武将牌上.每轮开始时,你将牌堆顶一张牌置入<东风>,然后你任意交换手牌与<东风>,然后你选择任意名角色,赋予其<大雾>或<狂风>标记,并弃置等量的<东风>',
                QD_dongfeng_append: '<大雾><span class="Qmenu">锁定技,</span>当你受到伤害时,若其的属性与随机一种属性不相同,则你防止之<br><狂风><span class="Qmenu">锁定技,</span>你受到的属性伤害翻倍',
                QD_dawu: '大雾',
                QD_dawu_info: '<span class="Qmenu">锁定技,</span>当你受到伤害时,若其的属性与随机一种属性不相同,则你防止之',
                QD_kuangfeng: '狂风',
                QD_kuangfeng_info: '<span class="Qmenu">锁定技,</span>你受到的属性伤害翻倍',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————神陆逊
                QD_shenluxun: '神陆逊',
                QD_junlve: '军略',
                QD_junlve_info: '<span class="Qmenu">锁定技,</span>当你受到或造成伤害后,你获得X个<军略>标记(X为伤害点数)',
                QD_cuike: '摧克',
                QD_cuike_info: '出牌阶段开始时,若<军略>标记的数量为奇数,你可以对一名角色造成军略数点伤害;若<军略>标记的数量为偶数,你可以横置一名角色并弃置其区域内的军略数张牌.然后,若<军略>标记的数量超过7个,你可以移去全部<军略>标记并对所有其他角色造成军略数点伤害.',
                QD_dinghuo: '绽火',
                QD_dinghuo_info: '限定技,出牌阶段,你可以移去全部<军略>标记,令至多等量的已横置角色弃置所有装备区内的牌.然后,你对其中一名角色造成军略数点火焰伤害.',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————春哥
                QD_chunge: '春哥',
                QD_jueqing: '绝情',
                QD_jueqing_info: '当你造成/受到伤害时,你可以弃置任意张牌,此伤害改为体力流失.若你弃置超过牌数大于对方体力值,你令此伤害+1/-1.<span class="Qmenu">锁定技,</span>当一名角色进入濒死状态时,若无伤害来源,你增加一点体力上限',
                QD_shangshi: '伤逝',
                QD_shangshi_info: '<span class="Qmenu">锁定技,</span>你手牌数始终不小于已损体力值(至少为1),你以此法获得的牌不可被响应且无次数距离限制',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————孙笨
                QD_孙笨: '孙笨',
                QD_yingzi: '英姿',
                QD_yingzi_info: '<span class="Qmenu">锁定技,</span>你的手牌上限+x,摸牌阶段你多摸x张牌,x为你的体力上限',
                QD_jiang: '激昂',
                QD_jiang_info: '<span class="Qmenu">锁定技,</span>当你使用红色基本牌或成为牌的唯一目标后,你摸一张牌,当你于因此摸牌数首次达到X张牌后,将记录值清零,你增加一点体力上限,选择一项:①回满体力;②摸X张牌;③获得<英魂>;④获得<英姿>.x为你的体力上限',
                QD_yinghun: '英魂',
                QD_yinghun_info: '准备阶段,你可以弃置一名角色至多X张牌,令一名角色摸剩余数量张牌,x为你的体力上限',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————孙权
                QD_孙权: '孙权',
                会玩: '会玩',
                会玩_info: '当你摸牌时,你改为从牌堆中挑选',
                //——————————————————————————————————————————————————————————————————————————————————————————————————————邓艾
                QD_dengai: '邓艾',
                QD_tuntian: '屯田',
                QD_tuntian_info: '<span class="Qmenu">锁定技,</span><出牌阶段外失去牌/出牌阶段内不因使用而失去牌>后,你可以获得其他角色的y张牌(y不大于2x),然后摸2x-y张牌(x为你失去牌的数量)',
                //——————————————————————————————————————————————————————————————————————————————————————————————————陆逊
                QD_luxun: '陆逊',
                QD_qianxun: '谦逊',
                QD_qianxun_info: '当一张锦囊牌被使用时,你可以将任意名角色至多X张牌当作<谦逊>牌置于你的武将牌上.每回合结束时,你可以选择获得任意张<谦逊>牌(X为你<谦逊>牌数且至少为一)',
                QD_lianying: '连营',
                QD_lianying_info: '锁定技,每当一个区域内失去最后一张牌时,你摸X张牌.当你一次性获得至少两张牌时,你可以分配其中的红色牌数点火焰伤害',
                //——————————————————————————————————————————————————————————————————————————————————————————————————周泰
                QD_zhoutai: '周泰',
                QD_buqu: '不屈',
                QD_buqu_info: '锁定技,当你进入濒死状态时,你可以令一名角色展示牌堆顶一张牌,若此牌与其武将牌上的不屈牌点数均不同,你将此牌置于其武将牌上,然后将体力恢复至1.否则你获得所有不屈牌,然后其执行一次濒死结算.若其因此死亡,则终止你的濒死结算.你的手牌上限+全场不屈牌的数量',
                //——————————————————————————————————————————————————————————————————————————————————————————————————陆抗
                QD_lukang: '陆抗',
                QD_qianjie: '谦节',
                QD_qianjie_info: '锁定技,你不能被横置与翻面,不能成为延时锦囊牌或其他角色拼点的目标,你可以重铸装备牌',
                QD_jueyan: '决堰',
                QD_jueyan_info: '每轮开始时,你可以废除一名角色的装备区',
                QD_poshi: '破势',
                QD_poshi_info: '一名角色回合开始时,若其存在废除的装备栏,你按被废除的区域执行:武器栏,你使用【杀】的次数上限永久+3;防具栏,你摸三张牌且手牌上限永久+3;坐骑栏,你使用牌无距离限制直到你的回合结束;宝物栏,你获得技能<集智>直到你的回合结束',
                //——————————————————————————————————————————————————————————————————————————————————————————————————朱桓
                QD_zhuhuan: '朱桓',
                QD_fenli: '奋励',
                QD_fenli_info: '一名角色回合开始时时,若其的(手牌数/体力值/装备区里的牌数)为全场最大,你可以令其跳过(摸牌阶段/出牌阶段/弃牌阶段)',
                QD_pingkou: '平寇',
                QD_pingkou_info: '一名角色回合结束时,你可以分配至多X点伤害(X为其本回合跳过的阶段数)',
                //——————————————————————————————————————————————————————————————————————————————————————————————————孙权
                QD_sunquan: '孙权',
                QD_zhiheng: '制衡',
                QD_zhiheng_info: '出牌阶段限一次,你可以弃置一名角色任意张牌,然后摸等量的牌(若弃置了一个区域内的所有牌,则多摸一张牌)',
                QD_jiuyuan: '救援',
                QD_jiuyuan_info: '主公技,当其他角色使用【桃】时,你可以令此牌目标改为你,然后你摸一张牌.锁定技,其他角色对你使用的【桃】回复的体力值+1.每回合限一次,当你需要使用【桃】时,你可以令任意其他角色代替你使用一张【桃】,否则该角色失去一点体力',
                //——————————————————————————————————————————————————————————————————————————————————————————————————黄盖
                QD_huanggai: '黄盖',
                QD_kurou: '苦肉',
                QD_kurou_info: '出牌阶段每名角色限一次,你可以弃置其一张牌令其失去1点体力',
                QD_zhaxiang: '诈降',
                QD_zhaxiang_info: '锁定技,当场上一名角色失去1点体力后,你摸x张牌,增加1点护甲,使用【杀】的次数永久+1,本阶段使用【杀】无距离限制且不能被响应(X为<詐降>发动次数)',
                //——————————————————————————————————————————————————————————————————————————————————————————————————周瑜
                QD_zhouyu: '周瑜',
                QD_yingzi: '英姿',
                QD_yingzi_info: '锁定技,你不因此技能获得牌时摸一张牌,每轮开始时,你可以令一名其他角色于本轮获得牌时随机少获得一张牌',
                QD_yingzi_2: '英姿',
                QD_yingzi_2_info: '获得牌时随机少获得一张牌',
                QD_fanjian: '反间',
                QD_fanjian_info: '出牌阶段每种花色限一次,你可以声明一个花色然后获得一名角色一张牌.若此牌花色与你声明的花色不同,其弃置与此牌花色相同的牌.若其因此弃置了牌,其失去1点体力',
                //——————————————————————————————————————————————————————————————————————————————————————————————————华佗
                QD_huatuo: '华佗',
                QD_jijiu: '急救',
                QD_jijiu_info: '你可以将场上或你区域内红色牌当张【桃】、黑色牌当【酒】对一名角色使用',
                QD_qingnang: '青囊',
                QD_qingnang_info: '出牌阶段每名角色限一次,你可以弃置其一张牌并令其失去或回复一点体力',
                QD_chuli: '除癀',
                QD_chuli_info: '每轮开始时,你可以弃置任意名角色各一张牌.当一名角色弃置非红色牌后,你可以令其摸或弃一张牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————黄月英
                QD_huangyueying: '黄月英',
                QD_jizhi: '集智',
                QD_jizhi_info: '每回合每种牌名限一次,你可以将两张花色相同的非锦囊牌当任意普通锦囊牌使用;一名角色使用锦囊牌时,你摸一张牌,手牌上限+1',
                QD_qicai: '奇才',
                QD_qicai_info: '锁定技,你使用锦囊牌无距离限制,你装备区内的牌不能因替换装备外失去',
                //——————————————————————————————————————————————————————————————————————————————————————————————————甄姬
                QD_zhenji: '甄姬',
                QD_luoshen: '洛神',
                QD_luoshen_info: '一名角色准备阶段,你进行一次判定并获得此牌,若结果不为红色,你重复此流程.锁定技,你的黑色牌不计入手牌上限和使用次数',
                QD_qingguo: '傾國',
                QD_qingguo_info: '你可以将一张黑色牌当做【闪】使用或打出.当你需要使用或打出闪时,其他所有角色选择是否交给你一张黑色牌,你可以令没交给你牌的角色受到一点无来源火焰伤害或翻面',
                //——————————————————————————————————————————————————————————————————————————————————————————————————大乔
                QD_daqiao: '大乔',
                QD_guose: '國色',
                QD_guose_info: '出牌阶段每名角色限一次,你可以观看并弃置其区域内的一张◆牌,然后你选择一项:1.视为对一名角色使用一张【乐不思蜀】;2.移动或弃置场上一张【乐不思蜀】.若如此做,你摸一张牌',
                QD_liuli: '流離',
                QD_liuli_info: '当你成为其他角色使用伤害牌的目标时,你可以弃置其一张牌,将此牌转移给一名其他角色',
                //——————————————————————————————————————————————————————————————————————————————————————————————————貂蝉
                QD_diaochan: '貂蝉',
                QD_lijian: '离间',
                QD_lijian_info: '出牌阶段每名角色限一次,你可以弃置其一张牌,选择一名其他角色,令后者视为对前者使用一张【决斗】',
                QD_biyue: '闭月',
                QD_biyue_info: '一名角色结束阶段,你摸两张牌',
                //——————————————————————————————————————————————————————————————————————————————————————————————————孙尚香
                QD_sunshangxiang: '孙尚香',
                QD_jieyin: '結姻',
                QD_jieyin_info: '出牌阶段每名角色限一次,你可以选择一名角色,然后你弃置其一张手牌或将其一张装备牌置入你的装备区.若如此做,你摸一张牌并回复1点体力',
                QD_xiaoji: '枭姬',
                QD_xiaoji_info: '全场角色失去装备牌后,你摸两张牌',
            };
            for (const i in translate) {
                if (lib.skill[i] || lib.character[i]) {
                    translate[i] = `缺德·${translate[i]}`;
                }
            }
            Object.assign(lib.translate, translate);
            const card = {
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
                    type: 'equip',
                    subtype: 'equip5',
                    skills: ['犀梳'],
                    ai: {
                        equipValue: 80,
                    },
                },
                琼梳: {
                    type: 'equip',
                    subtype: 'equip5',
                    skills: ['琼梳'],
                    ai: {
                        equipValue: 70,
                    },
                },
                金梳: {
                    type: 'equip',
                    subtype: 'equip5',
                    skills: ['金梳'],
                    ai: {
                        equipValue: 70,
                    },
                },
            };
            for (const i in card) {
                const info = card[i];
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
                if (info.mode && !info.mode.includes(lib.config.mode)) continue;
                let num = Math.ceil(Math.random() * 5);
                while (num-- > 0) {
                    lib.card.list.push([lib.suits.randomGet(), lib.number.randomGet(), i]);
                }
            }
            Object.assign(lib.card, card);
            lib.cardPack.缺德扩展 = Object.keys(card);
            lib.translate.缺德扩展_card_config = `缺德扩展`;
            lib.config.all.cards.add('缺德扩展');
            lib.config.cards.add('缺德扩展');
            lib.arenaReady.push(function () {
                lib.connectCardPack.add('缺德扩展');
            }); //扩展卡牌联机
            game.saveConfig(`extension_缺德扩展_cards_enable`, true); //扩展卡牌全部打开
            game.saveConfig('cards', lib.config.cards);
            game.saveConfig('defaultcards', lib.config.cards);
        },
        config: {
            群聊: {
                name: '<a href="https://qm.qq.com/q/SsTlU9gc24"><span class="Qmenu">【缺德扩展】群聊: 771901025</span></a>',
                clear: true,
            },
        },
        package: {
            intro: '仙界突破,对局中出现会被直呼缺德的强度',
            author: '代码:潜在水里的火(1476811518)<br>设计:杨天佑(2229694057)&&晴雪༦ོ风铃(1138146139)',
            version: '1.0',
        },
    };
});
