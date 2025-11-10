"use client";

import { BaziChart } from '@/types/bazi';
import { convertToROCDate } from '@/util/bazi';
import React from 'react';

interface PrintableBaziChartProps {
  chart: BaziChart;
}

const PrintableBaziChart: React.FC<PrintableBaziChartProps> = ({ chart }) => {
  // Calculate current age
  const currentYear = new Date().getFullYear();
  const birthYear = parseInt(chart.solar_date.split('年')[0]);
  const age = currentYear - birthYear + 1;

  // Get zodiac information
  const getZodiac = (yearZhi: string) => {
    const zodiacMap: Record<string, { name: string; icon: string }> = {
      '子': { name: '鼠', icon: '🐭' }, '丑': { name: '牛', icon: '🐂' }, 
      '寅': { name: '虎', icon: '🐅' }, '卯': { name: '兔', icon: '🐰' },
      '辰': { name: '龍', icon: '🐲' }, '巳': { name: '蛇', icon: '🐍' }, 
      '午': { name: '馬', icon: '🐴' }, '未': { name: '羊', icon: '🐑' }, 
      '申': { name: '猴', icon: '🐒' }, '酉': { name: '雞', icon: '🐓' }, 
      '戌': { name: '狗', icon: '🐕' }, '亥': { name: '豬', icon: '🐷' }
    };
    return zodiacMap[yearZhi] || { name: '未知', icon: '❓' };
  };

  const zodiacInfo = getZodiac(chart.year_pillar.zhi);

  // Determine current dayun/liunian based on backend-provided pillars
  const currentDayunIdx = React.useMemo(() => {
    if (chart.dayun_pillar) {
      const idx = chart.dayun.findIndex(du => du.gan === chart.dayun_pillar!.gan && du.zhi === chart.dayun_pillar!.zhi);
      if (idx !== -1) return idx;
    }
    return 0;
  }, [chart.dayun, chart.dayun_pillar]);

  const currentLiunianIdx = React.useMemo(() => {
    const du = chart.dayun[currentDayunIdx];
    if (!du) return 0;
    if (chart.liunian_pillar) {
      const idx = du.liunian.findIndex(ln => ln.year === chart.liunian_pillar!.year);
      if (idx !== -1) return idx;
    }
    return 0;
  }, [chart.dayun, chart.liunian_pillar, currentDayunIdx]);

  const containerStyle: React.CSSProperties = {
    background: 'white',
    color: 'black',
    fontFamily: '"Noto Serif SC", serif',
    padding: '5px 0 0 0',
    maxWidth: '210mm',
    margin: '0 auto',
    lineHeight: 1.4,
    fontSize: '16px', 
  };

  const printHeaderStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '20px',
    borderBottom: '2px solid black',
    paddingBottom: '15px',
  };

  const printTitleStyle: React.CSSProperties = {
    fontSize: '18px', 
    fontWeight: 'bold',
    marginBottom: '10px',
  };

  const basicInfoStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    fontSize: '16px', 
    marginBottom: '10px',
  };

  const basicInfoSpanStyle: React.CSSProperties = {
    border: '1px solid black',
    padding: '4px 8px',
    borderRadius: '4px',
  };

  const mainTableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '0',
    fontSize: '16px', 
  };

  const tableCellStyle: React.CSSProperties = {
    border: '1px solid black',
    padding: '8px',
    textAlign: 'center',
    verticalAlign: 'middle',
  };

  const tableHeaderStyle: React.CSSProperties = {
    ...tableCellStyle,
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  };

  const elementCellStyle: React.CSSProperties = {
    ...tableCellStyle,
    fontWeight: 'bold',
    fontSize: '30px', 
  };

  const hiddenStemsStyle: React.CSSProperties = {
    ...tableCellStyle,
    fontSize: '13px', 
    lineHeight: 1.2,
  };

  const fortuneSectionStyle: React.CSSProperties = {
    marginTop: '5px',
  };

  const fortuneTitleStyle: React.CSSProperties = {
    fontSize: '18px', 
    fontWeight: 'bold',
    marginBottom: '15px',
    textAlign: 'center',
    borderBottom: '1px solid black',
    paddingBottom: '5px',
  };

  const dayunGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(9, 1fr)',
    gap: '8px',
    marginBottom: '20px',
  };

  const dayunItemStyle: React.CSSProperties = {
    border: '1px solid black',
    padding: '6px',
    textAlign: 'center',
    fontSize: '13px', 
  };

  const dayunItemCurrentStyle: React.CSSProperties = {
    ...dayunItemStyle,
    backgroundColor: '#e0e0e0',
    fontWeight: 'bold',
  };

  const liunianGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: '6px',
  };

  const liunianItemStyle: React.CSSProperties = {
    border: '1px solid black',
    padding: '4px',
    textAlign: 'center',
    fontSize: '12px', 
  };

  const liunianItemCurrentStyle: React.CSSProperties = {
    ...liunianItemStyle,
    backgroundColor: '#e0e0e0',
    fontWeight: 'bold',
  };

  return (
    <div style={containerStyle}>

      {/* Header Section */}
      <div style={printHeaderStyle}>
        {/* <div style={printTitleStyle}>命盤資料</div> */}
        <div style={basicInfoStyle}>
          <span style={basicInfoSpanStyle}>生辰：{chart.solar_date}</span>
          <span style={basicInfoSpanStyle}>農曆：{convertToROCDate(chart.lunar_date)}</span>
          <span style={basicInfoSpanStyle}>{zodiacInfo.icon} {zodiacInfo.name}年</span>
          <span style={basicInfoSpanStyle}>現年：{age}歲</span>
        </div>
      </div>

      {/* Main Bazi Chart Table */}
      <div>
        {/* <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
          八字排盤
        </div> */}

        <table style={mainTableStyle}>
          {/* Header Row */}
          <thead>
            <tr>
              <th style={tableHeaderStyle}>流年</th>
              <th style={tableHeaderStyle}>大運</th>
              <th style={{ ...tableHeaderStyle, borderLeft: '2px solid black' }}>時柱</th>
              <th style={tableHeaderStyle}>日柱</th>
              <th style={tableHeaderStyle}>月柱</th>
              <th style={tableHeaderStyle}>年柱</th>
              <th style={tableHeaderStyle}></th>
            </tr>
          </thead>
          <tbody>
            {/* Main Stars Row */}
            <tr>
              <td style={tableCellStyle}>{chart.liunian_pillar?.gan_ten_deity || '-'}</td>
              <td style={tableCellStyle}>{chart.dayun_pillar?.gan_ten_deity || '-'}</td>
              <td style={{ ...tableCellStyle, borderLeft: '2px solid black' }}>{chart.hour_pillar.ten_deity}</td>
              <td style={tableCellStyle}>{chart.day_pillar.ten_deity}</td>
              <td style={tableCellStyle}>{chart.month_pillar.ten_deity}</td>
              <td style={tableCellStyle}>{chart.year_pillar.ten_deity}</td>
              <td style={tableCellStyle}><strong>主星</strong></td>
            </tr>

            {/* Heavenly Stems Row */}
            <tr>
              <td style={elementCellStyle}>
                {chart.liunian_pillar?.gan || '-'}
              </td>
              <td style={elementCellStyle}>
                {chart.dayun_pillar?.gan || '-'}
              </td>
              <td style={{ ...elementCellStyle, borderLeft: '2px solid black' }}>
                {chart.hour_pillar.gan}
              </td>
              <td style={elementCellStyle}>
                {chart.day_pillar.gan}
              </td>
              <td style={elementCellStyle}>
                {chart.month_pillar.gan}
              </td>
              <td style={elementCellStyle}>
                {chart.year_pillar.gan}
              </td>
              <td style={tableCellStyle}><strong>天干</strong></td>
            </tr>

            {/* Earthly Branches Row */}
            <tr>
              <td style={elementCellStyle}>
                {chart.liunian_pillar?.zhi || '-'}
              </td>
              <td style={elementCellStyle}>
                {chart.dayun_pillar?.zhi || '-'}
              </td>
              <td style={{ ...elementCellStyle, borderLeft: '2px solid black' }}>
                {chart.hour_pillar.zhi}
              </td>
              <td style={elementCellStyle}>
                {chart.day_pillar.zhi}
              </td>
              <td style={elementCellStyle}>
                {chart.month_pillar.zhi}
              </td>
              <td style={elementCellStyle}>
                {chart.year_pillar.zhi}
              </td>
              <td style={tableCellStyle}><strong>地支</strong></td>
            </tr>

            {/* Star Fortune Row */}
            <tr>
              <td style={tableCellStyle}>{chart.liunian_pillar?.zhi_ten_deity || '-'}</td>
              <td style={tableCellStyle}>{chart.dayun_pillar?.zhi_ten_deity || '-'}</td>
              <td style={{ ...tableCellStyle, borderLeft: '2px solid black' }}>{chart.hour_pillar.zhi_ten_deity}</td>
              <td style={tableCellStyle}>{chart.day_pillar.zhi_ten_deity}</td>
              <td style={tableCellStyle}>{chart.month_pillar.zhi_ten_deity}</td>
              <td style={tableCellStyle}>{chart.year_pillar.zhi_ten_deity}</td>
              <td style={tableCellStyle}><strong>星運</strong></td>
            </tr>

            {/* Hidden Stems Row */}
            <tr style={{ verticalAlign: 'top' }}>
              <td style={hiddenStemsStyle}>
                {chart.liunian_pillar?.hidden_stems.map((stem, idx) => (
                  <div key={idx}>
                    {stem.gan}({stem.ten_deity})
                  </div>
                )) || '-'}
              </td>
              <td style={hiddenStemsStyle}>
                {chart.dayun_pillar?.hidden_stems.map((stem, idx) => (
                  <div key={idx}>
                    {stem.gan}({stem.ten_deity})
                  </div>
                )) || '-'}
              </td>
              <td style={{ ...hiddenStemsStyle, borderLeft: '2px solid black' }}>
                {chart.hour_pillar.hidden_stems.map((stem, idx) => (
                  <div key={idx}>
                    {stem.gan}({stem.ten_deity})
                  </div>
                ))}
              </td>
              <td style={hiddenStemsStyle}>
                {chart.day_pillar.hidden_stems.map((stem, idx) => (
                  <div key={idx}>
                    {stem.gan}({stem.ten_deity})
                  </div>
                ))}
              </td>
              <td style={hiddenStemsStyle}>
                {chart.month_pillar.hidden_stems.map((stem, idx) => (
                  <div key={idx}>
                    {stem.gan}({stem.ten_deity})
                  </div>
                ))}
              </td>
              <td style={hiddenStemsStyle}>
                {chart.year_pillar.hidden_stems.map((stem, idx) => (
                  <div key={idx}>
                    {stem.gan}({stem.ten_deity})
                  </div>
                ))}
              </td>
              <td style={tableCellStyle}><strong>藏干</strong></td>
            </tr>

            {/* Nayin Row */}
            <tr>
              <td style={tableCellStyle}>{chart.liunian_pillar?.nayin || '-'}</td>
              <td style={tableCellStyle}>{chart.dayun_pillar?.nayin || '-'}</td>
              <td style={{ ...tableCellStyle, borderLeft: '2px solid black' }}>{chart.hour_pillar.nayin}</td>
              <td style={tableCellStyle}>{chart.day_pillar.nayin}</td>
              <td style={tableCellStyle}>{chart.month_pillar.nayin}</td>
              <td style={tableCellStyle}>{chart.year_pillar.nayin}</td>
              <td style={tableCellStyle}><strong>納音</strong></td>
            </tr>

            {/* Shensha Row */}
            <tr style={{ verticalAlign: 'top' }}>
              <td style={hiddenStemsStyle}>
                {chart.liunian_pillar?.shensha && chart.liunian_pillar.shensha.length > 0 ? (
                  chart.liunian_pillar.shensha.map((star, idx) => (
                    <div key={idx}>{star}</div>
                  ))
                ) : '-'}
              </td>
              <td style={hiddenStemsStyle}>
                {chart.dayun_pillar?.shensha && chart.dayun_pillar.shensha.length > 0 ? (
                  chart.dayun_pillar.shensha.map((star, idx) => (
                    <div key={idx}>{star}</div>
                  ))
                ) : '-'}
              </td>
              <td style={{ ...hiddenStemsStyle, borderLeft: '2px solid black' }}>
                {chart.hour_pillar.shensha && chart.hour_pillar.shensha.length > 0 ? (
                  chart.hour_pillar.shensha.map((star, idx) => (
                    <div key={idx}>{star}</div>
                  ))
                ) : '-'}
              </td>
              <td style={hiddenStemsStyle}>
                {chart.day_pillar.shensha && chart.day_pillar.shensha.length > 0 ? (
                  chart.day_pillar.shensha.map((star, idx) => (
                    <div key={idx}>{star}</div>
                  ))
                ) : '-'}
              </td>
              <td style={hiddenStemsStyle}>
                {chart.month_pillar.shensha && chart.month_pillar.shensha.length > 0 ? (
                  chart.month_pillar.shensha.map((star, idx) => (
                    <div key={idx}>{star}</div>
                  ))
                ) : '-'}
              </td>
              <td style={hiddenStemsStyle}>
                {chart.year_pillar.shensha && chart.year_pillar.shensha.length > 0 ? (
                  chart.year_pillar.shensha.map((star, idx) => (
                    <div key={idx}>{star}</div>
                  ))
                ) : '-'}
              </td>
              <td style={tableCellStyle}><strong>神煞</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Fortune Periods Section */}
      {chart.dayun && chart.dayun.length > 0 && (
        <div style={fortuneSectionStyle}>
          {/* <div style={fortuneTitleStyle}>大運流年</div> */}

          {/* Major Fortune Periods */}
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold'}}>大運</div>
            <div style={dayunGridStyle}>
              {chart.dayun.slice(0, 9).map((dayun, idx) => (
                <div 
                  key={idx} 
                  style={currentDayunIdx === idx ? dayunItemCurrentStyle : dayunItemStyle}
                >
                  <div>{dayun.liunian[0].year}</div>
                  <div>{dayun.start_age}歲</div>
                  <div>{dayun.gan}</div>
                  <div>{dayun.zhi}</div>
                  <div>{dayun.gan_ten_deity}</div>
                  <div>{dayun.zhi_ten_deity}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Year Fortune */}
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>流年</div>
            <div style={liunianGridStyle}>
              {chart.dayun[currentDayunIdx]?.liunian?.slice(0, 10).map((liunian, idx) => (
                <div 
                  key={idx} 
                  style={currentLiunianIdx === idx ? liunianItemCurrentStyle : liunianItemStyle}
                >
                  <div>{liunian.year}</div>
                  <div>{liunian.age}歲</div>
                  <div>{liunian.gan}</div>
                  <div>{liunian.zhi}</div>
                  <div>{liunian.gan_ten_deity}</div>
                  <div>{liunian.zhi_ten_deity}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintableBaziChart; 