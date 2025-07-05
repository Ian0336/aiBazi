#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import subprocess
import time
import json

def test_enhanced_api():
    response = requests.post('http://localhost:8000/api/bazi', json={
        'year': 1990,
        'month': 1, 
        'day': 1,
        'hour': 0,
        'is_lunar': False,
        'is_leap_month': False,
        'gender': 'male'
    })
    if response.status_code == 200:
        data = response.json()
        print('✅ Enhanced API Test Success!')
        # print(json.dumps(data, indent=4, ensure_ascii=False))
        # print('📅 Basic Info:')
        # print(f'   Ganzhi: {data["year_ganzhi"]} {data["month_ganzhi"]} {data["day_ganzhi"]} {data["hour_ganzhi"]}')
        # print(f'   Solar Date: {data["solar_date"]}')
        # print(f'   Lunar Date: {data["lunar_date"]}')
        # print()
        
        # print('🌟 Enhanced Analysis:')
        # analysis = data['analysis']
        # print(f'   Root Analysis: {analysis["root_analysis"]}')
        # print(f'   Day Master Strength: {analysis["day_master_strength"]["description"]}')
        # print(f'   Wuxing Scores: {analysis["wuxing_analysis"]["wuxing_scores"]}')
        # print(f'   Strongest Element: {analysis["wuxing_analysis"]["strongest_element"]}')
        # print(f'   Weakest Element: {analysis["wuxing_analysis"]["weakest_element"]}')
        # print(f'   Deity Counts: {analysis["deity_distribution"]["deity_counts"]}')
        # print(f'   Special Stars: {list(analysis["special_stars"].keys())}')
        # print(f'   Recommendations: {analysis["recommendations"]["advice"]}')
        # print()
        
        # print('🏺 Nayin:')
        # nayin = data['nayin']
        # print(f'   Year: {nayin["year"]}, Month: {nayin["month"]}, Day: {nayin["day"]}, Hour: {nayin["hour"]}')
        # print()
        
        # print('🔮 Empty Positions:')
        # empty = data['empty_positions']
        # print(f'   Empty Pair: {empty["empty_pair"]}, In Chart: {empty["empty_in_chart"]}')
        # print()

if __name__ == "__main__":
    test_enhanced_api() 