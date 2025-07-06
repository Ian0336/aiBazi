#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Safe wrapper to import only the functions from bazi.py without executing the main script
"""

import os
import sys
import collections
from typing import List, Dict, Any, Tuple

# Add the external bazi directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'external', 'bazi'))

# Import the data modules safely
from external.bazi.datas import *
from external.bazi.common import *
from external.bazi.ganzhi import *
from bazi.bazi_data import ten_deities_map, nayins_map, shensha_rules, shensha_other_rules, xiao_er_guan_sha_rules


# Define the functions directly here (copied from bazi.py) to avoid importing the script
def get_gen(gan, zhis):
    """Calculate root strength analysis"""
    zhus = []
    zhongs = []
    weis = []
    result = ""
    for item in zhis:
        zhu = zhi5_list[item][0]
        if ten_deities[gan]['本'] == ten_deities[zhu]['本']:
            zhus.append(item)

    for item in zhis:
        if len(zhi5_list[item]) == 1:
            continue
        zhong = zhi5_list[item][1]
        if ten_deities[gan]['本'] == ten_deities[zhong]['本']:
            zhongs.append(item)

    for item in zhis:
        if len(zhi5_list[item]) < 3:
            continue
        zhong = zhi5_list[item][2]
        if ten_deities[gan]['本'] == ten_deities[zhong]['本']:
            weis.append(item)

    if not (zhus or zhongs or weis):
        return "無根"
    else:
        result = result + "強：{}{}".format(''.join(zhus), chr(12288)) if zhus else result
        result = result + "中：{}{}".format(''.join(zhongs), chr(12288)) if zhongs else result
        result = result + "弱：{}".format(''.join(weis)) if weis else result
        return result


def gan_zhi_he(zhu):
    """Check for gan-zhi harmony"""
    gan, zhi = zhu
    if ten_deities[gan]['合'] in zhi5[zhi]:
        return "|"
    return ""


def get_gong(zhis):
    """Get special gong combinations"""
    result = []
    gans_list = list(zhis)  # This needs to be passed differently in real usage
    
    for i in range(3):
        # Note: This function in original bazi.py references global 'gans' 
        # We'll need to modify this to work properly
        zhi1 = zhis[i]
        zhi2 = zhis[i+1]
        if abs(Zhi.index(zhi1) - Zhi.index(zhi2)) == 2:
            value = Zhi[(Zhi.index(zhi1) + Zhi.index(zhi2))//2]
            result.append(value)
        if (zhi1 + zhi2 in gong_he) and (gong_he[zhi1 + zhi2] not in zhis):
            result.append(gong_he[zhi1 + zhi2])
            
    return result


def is_ku(zhi):
    """Check if a zhi is a treasury position"""
    return True if zhi in "辰戌丑未" else False


def zhi_ku(zhi, items):
    """Check if zhi is treasury and contains items"""
    return True if is_ku(zhi) and min(zhi5[zhi], key=zhi5[zhi].get) in items else False


def gan_ke(gan1, gan2):
    """Check if two gans have a restraining relationship"""
    return True if ten_deities[gan1]['克'] == ten_deities[gan2]['本'] or ten_deities[gan2]['克'] == ten_deities[gan1]['本'] else False


def jin_jiao(first, second):
    """Check for adjacent positions"""
    return True if Zhi.index(second) - Zhi.index(first) == 1 else False


def calculate_wuxing_scores(gans, zhis):
    """Calculate five element scores using the original bazi.py algorithm"""
    scores = {"金": 0, "木": 0, "水": 0, "火": 0, "土": 0}
    gan_scores = {"甲": 0, "乙": 0, "丙": 0, "丁": 0, "戊": 0, "己": 0, "庚": 0, "辛": 0, "壬": 0, "癸": 0}
    
    # Calculate scores same as bazi.py
    for item in gans:
        scores[gan5[item]] += 5
        gan_scores[item] += 5
    
    zhis_list = list(zhis)
    for item in zhis_list + [zhis_list[1]]:  # Include month zhi twice as in original
        for gan in zhi5[item]:
            scores[gan5[gan]] += zhi5[item][gan]
            gan_scores[gan] += zhi5[item][gan]
    
    return scores, gan_scores


def calculate_ten_deities(gans, zhis, day_master):
    """Calculate ten deities distribution as in bazi.py"""
    gan_shens = []
    for seq, item in enumerate(gans):    
        if seq == 2:  # Day master position
            gan_shens.append('日主')
        else:
            gan_shens.append(get_ten_deity(day_master, item))

    zhi_shens = []  # Main qi of earthly branches
    for item in zhis:
        d = zhi5[item]
        zhi_shens.append(get_ten_deity(day_master, max(d, key=d.get)))
    
    return gan_shens, zhi_shens


def check_day_master_strength(gans, zhis, day_master):
    """Check day master strength using original algorithm"""
    me_status = []
    weak = True
    
    for item in zhis:
        me_status.append(ten_deities[day_master][item])
        if ten_deities[day_master][item] in ('长', '帝', '建'):
            weak = False
    
    # Additional check from original code
    gan_shens, zhi_shens = calculate_ten_deities(gans, zhis, day_master)
    shens = gan_shens + zhi_shens
    
    if weak:
        if shens.count('比') + me_status.count('库') > 2:
            weak = False
    
    return not weak  # Return True for strong, False for weak


def get_nayin_for_ganzhi(gan: str, zhi: str) -> str:
    """Get nayin for a gan-zhi pair"""
    try:
        return nayins.get((gan, zhi), "unknown")
    except:
        return "unknown"


def get_empty_positions(day_gan: str, day_zhi: str, all_zhis: List[str]) -> Dict[str, Any]:
    """Calculate empty positions (空亡)"""
    try:
        empty_pair = empties.get((day_gan, day_zhi), ())
        empty_in_chart = [zhi for zhi in all_zhis if zhi in empty_pair]
        
        return {
            "empty_pair": list(empty_pair),
            "empty_in_chart": empty_in_chart,
            "count": len(empty_in_chart)
        }
    except:
        return {
            "empty_pair": [],
            "empty_in_chart": [],
            "count": 0
        }
def get_ten_deity(key, value):
    """Get ten deity for a gan-zhi pair"""
    original_value = ten_deities[key].get(value, "unknown")
    return ten_deities_map.get(original_value, original_value)
def get_nayin(gan, zhi):
    """Get nayin for a gan-zhi pair"""
    original_value = nayins.get((gan, zhi), "unknown")
    return nayins_map.get(original_value, original_value)


def apply_shensha_rules(shansha, data):
    """Apply general shensha rules"""
    for rule in shensha_rules:
        name = rule["name"]
        key_type = rule["key_type"]  # "gan" or "zhi"
        value_type = rule["value_type"]  # "gan" or "zhi"
        key_pillars = rule["key_pillar"]  # which pillars to check as key
        mapping = rule["mapping"]
        # Check each key pillar
        for key_pillar in key_pillars:
            key_value = data[key_type][key_pillar]
            if key_value in mapping:
                target_values = mapping[key_value]
                # Check all pillars for matches
                for pillar in ["year", "month", "day", "time"]:
                    if pillar == key_pillars: continue
                    pillar_value = data[value_type][pillar]
                    if pillar_value in target_values:
                        shansha[pillar].append(name)
    
    return shansha

def apply_shensha_other_rules(shansha, data):
    """Apply other shensha rules with special formats"""
    for rule in shensha_other_rules:
        name = rule["name"]
        format_patterns = rule["format"]
        values = rule["value"]
        
        # Check each format pattern
        for format_pattern in format_patterns:
            # Build current combination based on format
            current_combination = []
            pillars_involved = []
            
            for pillar_spec, type_spec in format_pattern:
                current_combination.append(data[type_spec][pillar_spec])
                pillars_involved.append(pillar_spec)
            
            current_tuple = tuple(current_combination)
            
            # Check if current combination matches any target value
            for target_value in values:
                if isinstance(target_value, tuple) and current_tuple == target_value:
                    # Add to all involved pillars
                    shansha["day"].append(name)
                    break
    
    return shansha

def apply_xiao_er_guan_sha_rules(shansha, data):
    """Apply children-specific rules (小兒關煞)"""
    for rule in xiao_er_guan_sha_rules:
        name = rule["name"]
        key_type = rule["key_type"]  # "gan" or "zhi"
        value_type = rule["value_type"]  # "gan" or "zhi"
        key_pillars = rule["key_pillar"]  # which pillars to check as key
        value_pillar = rule.get("value_pillar", None)  # specific pillar to check for value
        mapping = rule["mapping"]
        
        # Check each key pillar
        for key_pillar in key_pillars:
            key_value = data[key_type][key_pillar]
            
            if key_value in mapping:
                target_values = mapping[key_value]
                if not isinstance(target_values, list):
                    target_values = [target_values]
                
                # Check specific pillar or all pillars for matches
                pillars_to_check = [value_pillar] if value_pillar else ["time"]
                
                for pillar in pillars_to_check:
                    pillar_value = data[value_type][pillar]
                    
                    if pillar_value in target_values:
                        print(name,key_value, pillar_value, target_values)
                        print(value_pillar)
                        shansha["time"].append(name)
                        break
    
    return shansha
def analyze_special_stars(gans, zhis, day_master):
    """Analyze special stars and patterns"""
    analysis = {}
    
    # Day master zodiac and characteristics
    day_zhi = zhis[2] if len(zhis) > 2 else zhis[0]
    
    # Check for Yang Blade (羊刃)
    key = '帝' if Gan.index(day_master) % 2 == 0 else '冠'
    if ten_deities[day_master].inverse[key] in zhis:
        analysis['yang_blade'] = {
            "position": ten_deities[day_master].inverse[key],
            "description": "羊刃重重又見祿，富貴饒金玉" if ten_deities[day_master].inverse['冠'] else "勞累命"
        }
    
    # Check for Jiang Xing (将星)
    other_zhis = list(zhis[:2]) + list(zhis[3:]) if len(zhis) > 3 else list(zhis)
    jiang_xing = None
    
    if day_zhi in ("申", "子", "辰") and "子" in other_zhis:
        jiang_xing = "子"
    elif day_zhi in ("丑", "巳", "酉") and "酉" in other_zhis:
        jiang_xing = "酉"
    elif day_zhi in ("寅", "午", "戌") and "午" in other_zhis:
        jiang_xing = "午"
    elif day_zhi in ("亥", "卯", "未") and "卯" in other_zhis:
        jiang_xing = "卯"
    
    if jiang_xing:
        analysis['jiang_xing'] = {
            "star": jiang_xing,
            "description": "將星: 常欲吉星相扶，貴煞加臨乃為吉慶"
        }
    
    # Check for Hua Gai (华盖)
    hua_gai = None
    if day_zhi in ("申", "子", "辰") and "辰" in other_zhis:
        hua_gai = "辰"
    elif day_zhi in ("丑", "巳", "酉") and "丑" in other_zhis:
        hua_gai = "丑"
    elif day_zhi in ("寅", "午", "戌") and "戌" in other_zhis:
        hua_gai = "戌"
    elif day_zhi in ("亥", "卯", "未") and "未" in other_zhis:
        hua_gai = "未"
    
    if hua_gai:
        analysis['hua_gai'] = {
            "star": hua_gai,
            "description": "華蓋: 多主孤寡，總貴亦不免孤獨，作僧道藝術論"
        }
    
    return analysis 