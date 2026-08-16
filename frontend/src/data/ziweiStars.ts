/**
 * 紫微斗數 星曜釋義 — 十四主星與十四輔星（六吉、六煞、祿存、天馬）。
 *
 * 涵蓋範圍對應後端 /api/ziwei 回傳的 major_stars 與 minor_stars，雜曜
 * (adjective_stars) 不在此表內。五行／化氣／星系採傳統通說，司職與性格
 * 為各家共通的基本盤，實際論斷仍須合參宮位、廟旺與四化。
 */

export type ZiweiStarCategory = 'major' | 'lucky' | 'malefic' | 'fortune';

export interface ZiweiStarInfo {
  name: string;
  category: ZiweiStarCategory;
  /** 五行屬性 */
  element: string;
  /** 化氣 */
  transform: string;
  /** 星系，如 北斗 / 南斗 / 六吉 / 六煞 */
  group: string;
  /** 司職 — 這顆星主管的領域 */
  governs: string;
  /** 一句話定位 */
  summary: string;
  /** 性格與表現關鍵詞 */
  traits: string[];
}

export const ZIWEI_STAR_CATEGORY_LABEL: Record<ZiweiStarCategory, string> = {
  major: '主星',
  lucky: '六吉星',
  malefic: '六煞星',
  fortune: '祿馬',
};

const MAJOR_STARS: ZiweiStarInfo[] = [
  {
    name: '紫微',
    category: 'major',
    element: '陰土',
    transform: '尊',
    group: '北斗',
    governs: '事業、官貴、領導',
    summary: '帝王星，主尊貴與統御，是全盤的核心，安於何宮即定基調。',
    traits: ['敦厚老成', '謙恭有禮', '主觀強', '好面子', '喜居主導', '需百官朝拱方顯格局'],
  },
  {
    name: '天機',
    category: 'major',
    element: '陰木',
    transform: '善',
    group: '北斗',
    governs: '智慧、謀略、兄弟手足',
    summary: '智星、軍師之星，主思考與應變，善策劃而不擅執行。',
    traits: ['聰明敏銳', '心思縝密', '企劃力強', '善變多慮', '易鑽牛角尖', '宜動不宜靜'],
  },
  {
    name: '太陽',
    category: 'major',
    element: '陽火',
    transform: '貴',
    group: '北斗',
    governs: '聲名、顯貴、官祿、父星',
    summary: '光明博施之星，主名聲與付出，重貴不重富。',
    traits: ['熱忱光明', '博愛付出', '重面子形象', '不計回報', '廟旺積極', '落陷急躁易勞碌'],
  },
  {
    name: '武曲',
    category: 'major',
    element: '陰金',
    transform: '財',
    group: '北斗',
    governs: '財富、武勇、行動力',
    summary: '正財星，主實質財富與執行力，剛毅果決但性情孤剛。',
    traits: ['剛毅果決', '務實重信', '執行力強', '保守穩健', '性剛寡合', '不善柔性表達'],
  },
  {
    name: '天同',
    category: 'major',
    element: '陽水',
    transform: '福',
    group: '北斗',
    governs: '福德、享受、情緒',
    summary: '福星，主安樂與情緒調和，逢難能解，但易流於安逸。',
    traits: ['溫和圓融', '樂天知命', '人緣佳', '有口福', '不喜衝突', '易怠惰缺衝勁'],
  },
  {
    name: '廉貞',
    category: 'major',
    element: '陰火・陰水',
    transform: '囚',
    group: '北斗',
    governs: '執行力、人際公關、次桃花',
    summary: '次桃花兼囚星，性格兩極：得地為交際長才，失地則自困於心。',
    traits: ['公關長才', '感情豐富', '原則性強', '愛恨分明', '情緒起伏', '易自我糾結'],
  },
  {
    name: '天府',
    category: 'major',
    element: '陽土',
    transform: '賢能',
    group: '南斗',
    governs: '財帛、田宅、庫藏',
    summary: '財庫星、南斗帝星，主守成積累，穩健保守而不喜冒進。',
    traits: ['老成持重', '慎謀能斷', '危機意識強', '重實際', '保守固執', '善理財守成'],
  },
  {
    name: '太陰',
    category: 'major',
    element: '陰水',
    transform: '富',
    group: '南斗',
    governs: '田宅、財帛、不動產、母星',
    summary: '富星，主藏財與內斂，重實質積累，性情細膩敏感。',
    traits: ['細膩體貼', '洞察力強', '善解人意', '被動內斂', '情緒起伏大', '重視居家'],
  },
  {
    name: '貪狼',
    category: 'major',
    element: '陽木・陽水',
    transform: '桃花',
    group: '南斗',
    governs: '慾望、才藝、應酬、物質享受',
    summary: '第一桃花星，也是才藝與慾望之星，多才多能而興趣易散。',
    traits: ['多才多藝', '能言善道', '親和力強', '興趣廣泛', '善於交際', '易半途而廢'],
  },
  {
    name: '巨門',
    category: 'major',
    element: '陰水・陰土',
    transform: '暗',
    group: '南斗',
    governs: '口舌、是非、研究、隱晦之事',
    summary: '暗星，以口為業之星，善辯多疑，能鑽研亦易招是非。',
    traits: ['口才佳善辯', '推理研究力強', '心思深沉', '多疑慮', '防衛心重', '需以專業化解是非'],
  },
  {
    name: '天相',
    category: 'major',
    element: '陽水',
    transform: '印',
    group: '南斗',
    governs: '爵祿、衣食、輔佐、掌印',
    summary: '印星，宰輔之星，主輔佐與衣食享受，隨夾宮吉凶而變。',
    traits: ['忠誠輔佐', '審時度勢', '慈愛惻隱', '重衣食品味', '耳根較軟', '受夾宮影響大'],
  },
  {
    name: '天梁',
    category: 'major',
    element: '陽土',
    transform: '蔭',
    group: '南斗',
    governs: '壽、貴、監察、化解災厄',
    summary: '蔭星、老人星，主庇蔭與解厄，清高而有原則，逢凶化吉。',
    traits: ['清高有原則', '逢凶化吉', '愛照顧人', '老成持重', '好管閒事', '善於監察審核'],
  },
  {
    name: '七殺',
    category: 'major',
    element: '陽金・陽火',
    transform: '將星',
    group: '南斗',
    governs: '權柄、肅殺、開創',
    summary: '將星，主威權與衝鋒，敢於冒險獨當一面，性急而果決。',
    traits: ['果決獨立', '敢於冒險', '使命必達', '自我要求高', '性急易怒', '喜掌實權'],
  },
  {
    name: '破軍',
    category: 'major',
    element: '陰水',
    transform: '耗',
    group: '南斗',
    governs: '破壞、開創、變動、消耗',
    summary: '耗星，先破後立之星，主變動與開創，破舊立新但耗損亦大。',
    traits: ['開創叛逆', '反傳統', '好勝不服輸', '前衛創新', '消耗性大', '感情慾望濃烈'],
  },
];

const MINOR_STARS: ZiweiStarInfo[] = [
  {
    name: '左輔',
    category: 'lucky',
    element: '陽土',
    transform: '助力',
    group: '六吉',
    governs: '平輩貴人、實質助力',
    summary: '助星，帶來同輩、同事的實質相助，穩重寬厚。',
    traits: ['忠厚寬容', '人緣佳', '做事盡職', '明處相助', '增強主星格局'],
  },
  {
    name: '右弼',
    category: 'lucky',
    element: '陰水',
    transform: '助力',
    group: '六吉',
    governs: '平輩貴人、機巧助力',
    summary: '助星，與左輔同性質，偏靈活機巧，多為暗中相助。',
    traits: ['豁達樂觀', '機巧多才', '好文學', '暗中相助', '桃花意味較左輔重'],
  },
  {
    name: '文昌',
    category: 'lucky',
    element: '陽金',
    transform: '科甲',
    group: '六吉',
    governs: '正統文才、考試、文書',
    summary: '科甲星，主正規學歷與文書之利，思路清晰記憶佳。',
    traits: ['文質彬彬', '記憶力佳', '利考試文憑', '重視條理', '化忌則文書契約易出錯'],
  },
  {
    name: '文曲',
    category: 'lucky',
    element: '陰水',
    transform: '科甲',
    group: '六吉',
    governs: '口才、才藝、異路功名',
    summary: '科甲星，偏才藝與表達，走非正統路線亦能成名。',
    traits: ['口才便給', '才藝多元', '風雅浪漫', '異路功名', '化忌則口舌是非'],
  },
  {
    name: '天魁',
    category: 'lucky',
    element: '陽火',
    transform: '陽貴',
    group: '六吉',
    governs: '明貴人、長輩提拔',
    summary: '陽貴人星，貴人多為男性長輩或上司，助力來得明顯。',
    traits: ['正直積極', '明處提拔', '長輩緣佳', '機遇來得直接', '常需大限流年觸發'],
  },
  {
    name: '天鉞',
    category: 'lucky',
    element: '陰火',
    transform: '陰貴',
    group: '六吉',
    governs: '暗貴人、機遇窗口',
    summary: '陰貴人星，貴人多為女性或暗中相助，助力潛移默化。',
    traits: ['自重好義', '暗中提攜', '機遇隱微', '異性緣佳', '需自身條件配合'],
  },
  {
    name: '擎羊',
    category: 'malefic',
    element: '陽金・陽火',
    transform: '刑',
    group: '六煞',
    governs: '刑傷、衝突、切割',
    summary: '刑星，外顯之煞，主衝動與果斷切割，廟旺時反可轉為競爭優勢。',
    traits: ['剛強衝動', '敢於切割', '易生刑傷', '外顯直接', '廟旺為競爭力', '落陷為破壞力'],
  },
  {
    name: '陀羅',
    category: 'malefic',
    element: '陰金',
    transform: '忌',
    group: '六煞',
    governs: '拖延、糾纏、暗損',
    summary: '忌星，內耗之煞，主事情反覆糾纏、拖磨難決。',
    traits: ['拖延反覆', '固執難轉', '暗中損耗', '磨而後成', '心結不易解'],
  },
  {
    name: '火星',
    category: 'malefic',
    element: '陽火',
    transform: '殺',
    group: '六煞',
    governs: '急躁、突發、爆發力',
    summary: '殺星，剛烈急躁，來得快去得快，與貪狼同宮反成「火貪格」。',
    traits: ['性急剛烈', '突發爆衝', '行動力強', '易生口角', '逢貪狼可暴發'],
  },
  {
    name: '鈴星',
    category: 'malefic',
    element: '陰火',
    transform: '殺',
    group: '六煞',
    governs: '壓抑、陰性煎熬',
    summary: '殺星，性質陰沉綿長，忍久必發，與貪狼同宮成「鈴貪格」。',
    traits: ['陰沉壓抑', '影響綿長', '忍耐後爆發', '暗中煎熬', '逢貪狼可暴發'],
  },
  {
    name: '地空',
    category: 'malefic',
    element: '陰火',
    transform: '空亡',
    group: '六煞',
    governs: '成空、幻想、不務實',
    summary: '空亡星，主計畫落空與物質流失，卻利於宗教、哲學與藝術。',
    traits: ['天馬行空', '想法脫俗', '事易成空', '不重物質', '利玄學藝術'],
  },
  {
    name: '地劫',
    category: 'malefic',
    element: '陽火',
    transform: '劫殺',
    group: '六煞',
    governs: '劫奪、耗損、意外破財',
    summary: '劫殺星，主財物與機會被劫奪，行事常異於常人。',
    traits: ['破耗損失', '意外變故', '想法特異', '不按牌理', '需防投資失利'],
  },
  {
    name: '祿存',
    category: 'fortune',
    element: '陰土',
    transform: '爵祿',
    group: '祿馬',
    governs: '財祿、俸祿、穩定收入',
    summary: '財祿星，主穩定進財與保守積累，本身帶孤剋，喜與吉星同會。',
    traits: ['正財穩定', '保守惜財', '善於積累', '性質孤剋', '前後必夾羊陀'],
  },
  {
    name: '天馬',
    category: 'fortune',
    element: '陽火',
    transform: '動',
    group: '祿馬',
    governs: '遷移、變動、奔波',
    summary: '驛馬星，主移動與變化，與祿存同會為「祿馬交馳」主動中生財。',
    traits: ['奔波遷動', '適合外出發展', '變動頻繁', '閒不下來', '逢祿存主動中生財'],
  },
];

export const ZIWEI_STARS: ZiweiStarInfo[] = [...MAJOR_STARS, ...MINOR_STARS];

const BY_NAME = new Map(ZIWEI_STARS.map((s) => [s.name, s]));

/** 查星曜釋義；雜曜與未收錄的星回傳 undefined。 */
export function getStarInfo(name: string): ZiweiStarInfo | undefined {
  return BY_NAME.get(name);
}
