#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from bazi_calculator import BaziCalculator

def test_enhanced_bazi():
    """Test the enhanced bazi calculator with comprehensive features"""
    
    calc = BaziCalculator()
    
    # Test the original problem date: 2003-1-15 10:00
    print("=== Enhanced Bazi Calculation Test ===")
    print("Testing problem date: 2003-01-15 10:00")
    print()
    
    result = calc.calculate_bazi(2003, 1, 15, 10)
    
    print("📅 Date Information:")
    print(f"   Solar Date: {result['solar_date']}")
    print(f"   Lunar Date: {result['lunar_date']}")
    print()
    
    print("🏯 Four Pillars (Bazi):")
    print(f"   Year:  {result['year_ganzhi']} (年柱)")
    print(f"   Month: {result['month_ganzhi']} (月柱)")
    print(f"   Day:   {result['day_ganzhi']} (日柱)")
    print(f"   Hour:  {result['hour_ganzhi']} (时柱)")
    print()
    
    print("🌟 Day Master Analysis:")
    day_master = result['analysis']['day_master_nature']
    print(f"   Day Master: {day_master['gan']} ({day_master['element']})")
    print(f"   Yang/Yin: {'Yang' if day_master['is_yang'] else 'Yin'}")
    print(f"   Strength: {result['analysis']['day_master_strength']['description']}")
    print()
    
    print("🍃 Five Elements Analysis:")
    wuxing = result['analysis']['wuxing_analysis']['wuxing_scores']
    total = result['analysis']['wuxing_analysis']['total_score']
    for element, score in wuxing.items():
        percentage = (score / total * 100) if total > 0 else 0
        print(f"   {element}: {score} ({percentage:.1f}%)")
    print(f"   Strongest: {result['analysis']['wuxing_analysis']['strongest_element']}")
    print(f"   Weakest: {result['analysis']['wuxing_analysis']['weakest_element']}")
    print()
    
    print("🌱 Root System Analysis:")
    print(f"   {result['analysis']['root_analysis']}")
    print()
    
    print("👥 Ten Deities Distribution:")
    deity_counts = result['analysis']['deity_distribution']['deity_counts']
    for deity, count in deity_counts.items():
        print(f"   {deity}: {count}")
    print()
    
    print("✨ Special Stars and Patterns:")
    special_stars = result['analysis']['special_stars']
    if special_stars:
        for star_name, star_info in special_stars.items():
            print(f"   {star_name}: {star_info.get('description', '')}")
    else:
        print("   No special stars detected")
    print()
    
    print("🏺 Nayin (Sound Elements):")
    nayin = result['nayin']
    print(f"   Year: {nayin['year']}")
    print(f"   Month: {nayin['month']}")
    print(f"   Day: {nayin['day']}")
    print(f"   Hour: {nayin['hour']}")
    print()
    
    print("🔮 Empty Positions (Kong Wang):")
    empty = result['empty_positions']
    print(f"   Empty Pair: {empty['empty_pair']}")
    print(f"   Empty in Chart: {empty['empty_in_chart']} (Count: {empty['count']})")
    print()
    
    print("💡 Recommendations:")
    advice = result['analysis']['recommendations']['advice']
    print(f"   {advice}")
    print()
    
    print("🔍 Detailed Pillar Analysis:")
    pillars = ['year_pillar', 'month_pillar', 'day_pillar', 'hour_pillar']
    pillar_names = ['年柱', '月柱', '日柱', '时柱']
    
    for pillar, name in zip(pillars, pillar_names):
        pillar_data = result[pillar]
        print(f"   {name} ({pillar_data['ganzhi']}):")
        print(f"     天干: {pillar_data['gan']} ({pillar_data['gan_wuxing']}) - {pillar_data['ten_deity']}")
        print(f"     地支: {pillar_data['zhi']} ({pillar_data['zhi_wuxing']})")
        print(f"     藏干: {[stem['gan'] + '(' + stem['ten_deity'] + ')' for stem in pillar_data['hidden_stems']]}")
        print(f"     库位: {'是' if pillar_data['is_treasury'] else '否'}")
        if pillar_data['harmony']:
            print(f"     干支合: {pillar_data['harmony']}")
    print()
    
    # Test analysis string method
    print("📝 Formatted Analysis:")
    analysis_str = calc.analyze_bazi(
        result['year_ganzhi'],
        result['month_ganzhi'], 
        result['day_ganzhi'],
        result['hour_ganzhi']
    )
    print(analysis_str)

if __name__ == "__main__":
    test_enhanced_bazi() 