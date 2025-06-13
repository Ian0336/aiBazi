#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import subprocess
import time
import json

def test_enhanced_api():
    """Test the FastAPI server with enhanced bazi calculator"""
    
    # Start the server in background
    print("Starting FastAPI server...")
    server_process = subprocess.Popen(['python', 'main.py'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(3)  # Wait for server to start
    
    try:
        # Test the enhanced API
        print("Testing enhanced API...")
        response = requests.post('http://localhost:8001/api/bazi', json={
            'year': 2003,
            'month': 1, 
            'day': 15,
            'hour': 10,
            'is_lunar': False
        })
        
        if response.status_code == 200:
            data = response.json()
            print('✅ Enhanced API Test Success!')
            print()
            print('📅 Basic Info:')
            print(f'   Ganzhi: {data["year_ganzhi"]} {data["month_ganzhi"]} {data["day_ganzhi"]} {data["hour_ganzhi"]}')
            print(f'   Solar Date: {data["solar_date"]}')
            print(f'   Lunar Date: {data["lunar_date"]}')
            print()
            
            print('🌟 Enhanced Analysis:')
            analysis = data['analysis']
            print(f'   Root Analysis: {analysis["root_analysis"]}')
            print(f'   Day Master Strength: {analysis["day_master_strength"]["description"]}')
            print(f'   Wuxing Scores: {analysis["wuxing_analysis"]["wuxing_scores"]}')
            print(f'   Strongest Element: {analysis["wuxing_analysis"]["strongest_element"]}')
            print(f'   Weakest Element: {analysis["wuxing_analysis"]["weakest_element"]}')
            print(f'   Deity Counts: {analysis["deity_distribution"]["deity_counts"]}')
            print(f'   Special Stars: {list(analysis["special_stars"].keys())}')
            print(f'   Recommendations: {analysis["recommendations"]["advice"]}')
            print()
            
            print('🏺 Nayin:')
            nayin = data['nayin']
            print(f'   Year: {nayin["year"]}, Month: {nayin["month"]}, Day: {nayin["day"]}, Hour: {nayin["hour"]}')
            print()
            
            print('🔮 Empty Positions:')
            empty = data['empty_positions']
            print(f'   Empty Pair: {empty["empty_pair"]}, In Chart: {empty["empty_in_chart"]}')
            print()
            
            # Test analyze endpoint
            print("Testing analyze endpoint...")
            analyze_response = requests.post('http://localhost:8001/api/analyze', json={
                'year_ganzhi': data['year_ganzhi'],
                'month_ganzhi': data['month_ganzhi'],
                'day_ganzhi': data['day_ganzhi'],
                'hour_ganzhi': data['hour_ganzhi']
            })
            
            if analyze_response.status_code == 200:
                analyze_data = analyze_response.json()
                print('✅ Analyze endpoint success!')
                print(f'Analysis: {analyze_data["analysis"]}')
            else:
                print('❌ Analyze endpoint failed:', analyze_response.status_code)
                
        else:
            print('❌ API Test Failed:', response.status_code, response.text)
            
    except Exception as e:
        print(f'❌ Test failed with exception: {e}')
        
    finally:
        print("Stopping server...")
        server_process.terminate()
        server_process.wait()

if __name__ == "__main__":
    test_enhanced_api() 