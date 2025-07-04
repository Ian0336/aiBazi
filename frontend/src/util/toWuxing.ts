export const Gan2Wuxing = (gan: string) => {
    const gan2Wuxing = {
        '甲': '木',
        '乙': '木',
        '丙': '火',
        '丁': '火',
        '戊': '土',
        '己': '土',
        '庚': '金',
        '辛': '金',
        '壬': '水',
        '癸': '水',
    }
    return gan2Wuxing[gan as keyof typeof gan2Wuxing]
}
export const Zhi2Wuxing = (zhi: string) => {
    const zhi2Wuxing = {
        '子': '水',
        '丑': '土',
        '寅': '木',
        '卯': '木',
        '辰': '土',
        '巳': '火',
        '午': '火',
        '未': '土',
        '申': '金',
        '酉': '金',
        '戌': '土',
        '亥': '水',
    }
    return zhi2Wuxing[zhi as keyof typeof zhi2Wuxing]
}