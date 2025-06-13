#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import json
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

from bazi_calculator import BaziCalculator

def test_problematic_dates():
    """Test dates that caused issues with the Go BaziGo library"""
    
    calculator = BaziCalculator()
    
    # Test dates that failed in Go
    problematic_dates = [
        (2003, 1, 15, 10),  # The original problematic date
        (2003, 1, 14, 10),
        (2003, 1, 16, 10),
        (2000, 1, 15, 10),
        (2001, 1, 15, 10),
        (2004, 1, 15, 10),
    ]
    
    # Test dates that worked in Go
    working_dates = [
        (2002, 1, 15, 10),
        (2005, 1, 15, 10),
        (2007, 1, 15, 10),
        (2003, 2, 15, 10),  # Different month in problematic year
    ]
    
    print("=" * 80)
    print("Testing Python Bazi Calculator")
    print("=" * 80)
    
    print("\n📅 Testing dates that failed in Go BaziGo library:")
    print("-" * 60)
    
    for year, month, day, hour in problematic_dates:
        try:
            result = calculator.calculate_bazi(year, month, day, hour)
            print(f"✅ {year}-{month:02d}-{day:02d} {hour:02d}:00 → SUCCESS")
            print(f"   八字: {result['year_ganzhi']} {result['month_ganzhi']} {result['day_ganzhi']} {result['hour_ganzhi']}")
            print(f"   农历: {result['lunar_date']}")
        except Exception as e:
            print(f"❌ {year}-{month:02d}-{day:02d} {hour:02d}:00 → FAILED: {e}")
    
    print("\n📅 Testing dates that worked in Go BaziGo library:")
    print("-" * 60)
    
    for year, month, day, hour in working_dates:
        try:
            result = calculator.calculate_bazi(year, month, day, hour)
            print(f"✅ {year}-{month:02d}-{day:02d} {hour:02d}:00 → SUCCESS")
            print(f"   八字: {result['year_ganzhi']} {result['month_ganzhi']} {result['day_ganzhi']} {result['hour_ganzhi']}")
            print(f"   农历: {result['lunar_date']}")
        except Exception as e:
            print(f"❌ {year}-{month:02d}-{day:02d} {hour:02d}:00 → FAILED: {e}")

def test_detailed_analysis():
    """Test detailed analysis for the original problematic date"""
    
    calculator = BaziCalculator()
    
    print("\n" + "=" * 80)
    print("Detailed Analysis for Original Problematic Date: 2003-1-15 10:00")
    print("=" * 80)
    
    try:
        # Test the original problematic date
        result = calculator.calculate_bazi(2003, 1, 15, 10)
        
        print(f"✅ 计算成功!")
        print(f"🗓️  公历日期: {result['solar_date']}")
        print(f"🌙 农历日期: {result['lunar_date']}")
        print(f"🎋 四柱八字: {result['year_ganzhi']} {result['month_ganzhi']} {result['day_ganzhi']} {result['hour_ganzhi']}")
        
        print(f"\n📊 详细分析:")
        print(f"   年柱: {result['year_pillar']['ganzhi']} ({result['year_pillar']['ten_deity']})")
        print(f"   月柱: {result['month_pillar']['ganzhi']} ({result['month_pillar']['ten_deity']})")
        print(f"   日柱: {result['day_pillar']['ganzhi']} ({result['day_pillar']['ten_deity']})")
        print(f"   时柱: {result['hour_pillar']['ganzhi']} ({result['hour_pillar']['ten_deity']})")
        
        print(f"\n🎵 纳音:")
        for pillar, nayin in result['nayin'].items():
            print(f"   {pillar}: {nayin}")
        
        print(f"\n⭕ 空亡: {result['empty_positions']['empty_pair']}")
        if result['empty_positions']['empty_in_chart']:
            print(f"   命局中空亡: {result['empty_positions']['empty_in_chart']}")
        
        print(f"\n🔍 基本分析:")
        analysis = result['analysis']
        print(f"   {analysis['summary']}")
        print(f"   五行分布: {analysis['wuxing_count']}")
        
        # Test analysis function
        print(f"\n📝 AI分析:")
        ai_analysis = calculator.analyze_bazi(
            result['year_ganzhi'],
            result['month_ganzhi'], 
            result['day_ganzhi'],
            result['hour_ganzhi']
        )
        print(ai_analysis)
        
    except Exception as e:
        print(f"❌ 计算失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_problematic_dates()
    test_detailed_analysis() 