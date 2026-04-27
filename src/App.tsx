import React, { useState, useEffect } from 'react';
import { Text, Spacing } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import Tesseract from 'tesseract.js';
import { useInAppAds } from './hooks/useInAppAds';
import './App.css';

const CORE_LIST = [
  "💪 1. 체력단련", "📚 2. 책 읽기", "🎧 3. 음원듣기 (성공자)", "🤝 4. 미팅 참석", "🛍️ 5. 제품애용",
  "👥 6. 소비자 관리", "📊 7. 사업설명", "❤️ 8. 신뢰쌓기", "🧭 9. 상담", "📱 10. e-커뮤니케이션"
];

const CORE_HINTS = [
  "운동 내용", "책 제목/한줄", "음원 제목/느낀점", "미팅 주제", "애용 제품",
  "관리 내용 (데몬 횟수 입력 시 자동 체크)", "설명 내용 (횟수 입력 시 자동 체크)", "신뢰쌓기 활동", "상담 내용", "SNS 소통"
];

const GOAL_FIELDS = [
  { id: 'dream', label: '✨ 나의 꿈', placeholder: '하고 싶은 것, 가고 싶은 곳, 되고 싶은 것' },
  { id: 'fiveYears', label: '🚀 5년 뒤 목표', placeholder: '목표 직급 및 수입' },
  { id: 'month', label: '📅 한달 목표', placeholder: '이번 달 달성할 핵심 목표' },
  { id: 'day', label: '🔥 하루 목표', placeholder: '선택한 날짜에 반드시 해낼 일' }
];

function App() {
  const dateObj = new Date();
  const todayStr = dateObj.toISOString().split('T')[0];
  const currentMonth = dateObj.getMonth();
  const currentYear = dateObj.getFullYear();

  const { showRewardedAd } = useInAppAds();

  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [goals, setGoals] = useState({ dream: '', fiveYears: '', month: '', day: '' });
  const [isLocked, setIsLocked] = useState({ dream: false, fiveYears: false, month: false, day: false });
  const [cores, setCores] = useState<boolean[]>(Array(10).fill(false));
  const [coreTexts, setCoreTexts] = useState<string[]>(Array(10).fill(''));
  const [counts, setCounts] = useState({ demon: 0, stp: 0 });
  const [memo, setMemo] = useState('');

  // 💎 포인트 및 직급(Rank), 연속 공유(Streak) 상태 관리
  const [points, setPoints] = useState(0);
  const [rank, setRank] = useState('도전자');
  const [shareStreak, setShareStreak] = useState(0);
  const [lastShareDate, setLastShareDate] = useState('');

  const [history, setHistory] = useState<Record<string, number>>({});
  const [countsHistory, setCountsHistory] = useState<Record<string, { demon: number, stp: number }>>({});

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    const savedGoals = localStorage.getItem('success_goals_v4');
    const savedLocks = localStorage.getItem('success_locks_v4');
    const savedPoints = localStorage.getItem('success_points');
    const savedRank = localStorage.getItem('success_rank');
    const savedStreak = localStorage.getItem('success_streak');
    const savedLastShare = localStorage.getItem('success_last_share');
    const savedHistory = localStorage.getItem('success_history');
    const savedCountsHistory = localStorage.getItem('success_counts_history');

    const savedCores = localStorage.getItem(`success_cores_biz_${selectedDate}`);
    const savedCoreTexts = localStorage.getItem(`success_core_texts_biz_${selectedDate}`);
    const savedCounts = localStorage.getItem(`success_counts_${selectedDate}`);
    const savedMemo = localStorage.getItem(`success_memo_biz_${selectedDate}`);
    const savedPhoto = localStorage.getItem(`success_photo_${selectedDate}`);
    const savedOCR = localStorage.getItem(`success_ocr_${selectedDate}`);

    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedLocks) setIsLocked(JSON.parse(savedLocks));
    if (savedPoints) setPoints(parseInt(savedPoints));
    if (savedRank) setRank(savedRank);
    if (savedStreak) setShareStreak(parseInt(savedStreak));
    if (savedLastShare) setLastShareDate(savedLastShare);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedCountsHistory) setCountsHistory(JSON.parse(savedCountsHistory));

    setCores(savedCores ? JSON.parse(savedCores) : Array(10).fill(false));
    setCoreTexts(savedCoreTexts ? JSON.parse(savedCoreTexts) : Array(10).fill(''));
    setCounts(savedCounts ? JSON.parse(savedCounts) : { demon: 0, stp: 0 });
    setMemo(savedMemo ? savedMemo : '');
    setPhotoUrl(savedPhoto ? savedPhoto : null);
    setExtractedText(savedOCR ? savedOCR : '');
  }, [selectedDate]);

  useEffect(() => {
    const newCores = [...cores];
    newCores[5] = counts.demon > 0;
    newCores[6] = counts.stp > 0;
    if (JSON.stringify(newCores) !== JSON.stringify(cores)) setCores(newCores);
  }, [counts]);

  useEffect(() => {
    localStorage.setItem('success_goals_v4', JSON.stringify(goals));
    localStorage.setItem('success_locks_v4', JSON.stringify(isLocked));
    localStorage.setItem('success_points', points.toString());
    localStorage.setItem('success_rank', rank);
    localStorage.setItem('success_streak', shareStreak.toString());
    localStorage.setItem('success_last_share', lastShareDate);

    localStorage.setItem(`success_cores_biz_${selectedDate}`, JSON.stringify(cores));
    localStorage.setItem(`success_core_texts_biz_${selectedDate}`, JSON.stringify(coreTexts));
    localStorage.setItem(`success_counts_${selectedDate}`, JSON.stringify(counts));
    localStorage.setItem(`success_memo_biz_${selectedDate}`, memo);

    if (photoUrl) localStorage.setItem(`success_photo_${selectedDate}`, photoUrl);
    else localStorage.removeItem(`success_photo_${selectedDate}`);

    if (extractedText) localStorage.setItem(`success_ocr_${selectedDate}`, extractedText);
    else localStorage.removeItem(`success_ocr_${selectedDate}`);

    const completedCount = cores.filter(Boolean).length;
    setHistory(prev => {
      const updated = { ...prev, [selectedDate]: completedCount };
      localStorage.setItem('success_history', JSON.stringify(updated));
      return updated;
    });

    setCountsHistory(prev => {
      const updated = { ...prev, [selectedDate]: counts };
      localStorage.setItem('success_counts_history', JSON.stringify(updated));
      return updated;
    });
  }, [goals, isLocked, cores, coreTexts, counts, memo, points, rank, shareStreak, lastShareDate, photoUrl, extractedText, selectedDate]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  let monthCoresDone = 0;
  let monthDemonTotal = 0;
  let monthStpTotal = 0;

  Object.keys(history).forEach(dateStr => {
    if (dateStr.startsWith(currentMonthPrefix)) monthCoresDone += history[dateStr];
  });
  Object.entries(countsHistory).forEach(([dateStr, dailyCounts]) => {
    if (dateStr.startsWith(currentMonthPrefix)) {
      monthDemonTotal += dailyCounts.demon || 0;
      monthStpTotal += dailyCounts.stp || 0;
    }
  });

  const monthPossibleCores = daysInMonth * 10;
  const monthProgressPercent = monthPossibleCores > 0 ? Math.round((monthCoresDone / monthPossibleCores) * 100) : 0;

  const toggleCore = (index: number) => {
    if (index === 5 || index === 6) return;
    const newCores = [...cores];
    newCores[index] = !newCores[index];
    setCores(newCores);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);

    setIsExtracting(true);
    setExtractedText('');
    try {
      const result = await Tesseract.recognize(file, 'kor');
      setExtractedText(result.data.text);
    } catch (error) {
      setExtractedText('텍스트 변환에 실패했습니다.');
    } finally {
      setIsExtracting(false);
    }
  };

  // 🚀 직급 승급 및 보너스 포인트 로직
  const handleShare = async () => {
    try {
      // 1. 보상형 광고 띄우기
      await showRewardedAd('test-rewarded-ad-key');

      // 2. 연속 공유 일수(Streak) 계산 로직
      let newStreak = shareStreak;
      let isStreakIncreased = false;

      if (lastShareDate !== todayStr) {
        if (lastShareDate) {
          // 마지막 공유일과 오늘의 날짜 차이 계산
          const lastDate = new Date(lastShareDate);
          const currDate = new Date(todayStr);
          const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

          if (diffDays === 1) {
            newStreak += 1; // 어제도 하고 오늘도 했음
            isStreakIncreased = true;
          } else {
            newStreak = 1; // 하루라도 빼먹었으면 1일차로 초기화 ㅠㅠ
            isStreakIncreased = true;
          }
        } else {
          newStreak = 1; // 완전 처음 공유하는 경우
          isStreakIncreased = true;
        }
      }

      // 3. 직급 승급 및 보너스 포인트 확인 (연속 일수가 올랐을 때만 1회성 지급)
      let bonusPoints = 0;
      let newRank = rank;

      if (isStreakIncreased) {
        if (newStreak === 100) { newRank = 'SP'; bonusPoints = 100; }
        else if (newStreak === 200) { newRank = '사파이어'; bonusPoints = 200; }
        else if (newStreak === 300) { newRank = '에메랄드'; bonusPoints = 300; }
        else if (newStreak === 500) { newRank = '다이아몬드'; bonusPoints = 1000; }
      }

      // 4. 공유할 텍스트에 직급과 연속 달성일 추가!
      const completedCount = cores.filter(Boolean).length;
      const shareText = `🌟 [성공일기 10코어] 🌟\n📅 날짜: ${selectedDate}\n🔥 오늘 달성: ${completedCount}/10\n🔥 연속 공유: ${newStreak}일째 진행 중!\n👑 현재 직급: ${newRank}\n📊 월 누적 달성률: ${monthProgressPercent}%\n🚀 월 누적 STP: ${monthStpTotal}회\n👥 월 누적 데몬: ${monthDemonTotal}회`;

      if (navigator.share) {
        await navigator.share({ title: '성공일기 10코어', text: shareText });
      } else {
        navigator.clipboard.writeText(shareText);
        alert("내용이 복사되었습니다! 카카오톡에 붙여넣기 해보세요. 📋");
      }

      // 5. 모든 상태 업데이트 및 보상 지급
      setShareStreak(newStreak);
      setLastShareDate(todayStr);
      setRank(newRank);
      setPoints(p => p + 1 + bonusPoints); // 기본 1점 + 승급 시 보너스 점수

      if (bonusPoints > 0) {
        alert(`🎉 기적을 만들고 계십니다! 연속 ${newStreak}일 달성!\n[${newRank}] 승급 및 ${bonusPoints}P 보너스가 지급되었습니다! 💎💎💎`);
      } else {
        alert(`🎉 광고 시청 완료! 기본 1포인트 지급 (현재 연속 ${newStreak}일째 🔥)`);
      }

    } catch (error) {
      console.error("광고 에러 또는 공유 취소:", error);
      alert("광고를 끝까지 시청하셔야 포인트가 지급됩니다! 🥲 (또는 현재 기기에서 광고를 불러올 수 없습니다)");
    }
  };

  const renderCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const count = history[dateStr] || 0;
      const isSelected = dateStr === selectedDate;

      days.push(
        <div
          key={d}
          onClick={() => setSelectedDate(dateStr)}
          style={{ cursor: 'pointer' }}
          className={`calendar-day active ${count === 10 ? 'completed' : ''} ${isSelected ? 'selected' : ''}`}
        >
          {d}
          {count > 0 && <div className="calendar-dot" />}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="toss-wrapper">
      <div className="toss-container">
        {/* 👑 직급과 연속 일수가 표시되는 업그레이드된 헤더 */}
        <header className="header" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Text typography="t3" fontWeight="bold">성공일기 10코어 🔥</Text>
            <div className="header-badges">
              <div className="rank-badge">👑 {rank}</div>
              <div className="points-badge">💎 {points} P</div>
            </div>
          </div>
          <div className="streak-text">🔥 멈추지 않는 열정! 연속 공유 {shareStreak}일째 진행 중</div>
        </header>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{monthCoresDone}개</div><div className="stat-label">이번 달 코어 실천</div></div>
          <div className="stat-card"><div className="stat-value">{monthProgressPercent}%</div><div className="stat-label">이번 달 전체 달성률</div></div>
          <div className="stat-card"><div className="stat-value">{monthStpTotal}회</div><div className="stat-label">이번 달 누적 STP</div></div>
          <div className="stat-card"><div className="stat-value">{monthDemonTotal}회</div><div className="stat-label">이번 달 누적 데몬</div></div>
        </div>

        <div className="section-title">🗓️ {currentMonth + 1}월 성공 달력</div>
        <div className="card" style={{ textAlign: 'center', marginBottom: 12, padding: '12px', color: '#3182F6', fontWeight: 'bold' }}>
          현재 보고 있는 날짜: {selectedDate}
        </div>
        <div className="calendar-card"><div className="calendar-grid">{['일','월','화','수','목','금','토'].map(d => <div key={d} className="calendar-day-label">{d}</div>)}{renderCalendar()}</div></div>

        <div className="section-title">🎯 나의 확고한 목표</div>
        <div className="card">
          {GOAL_FIELDS.map((field) => {
            const id = field.id as keyof typeof goals;
            return (
              <div className="goal-input-group" key={id} style={{ marginBottom: id === 'day' ? 0 : 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label>{field.label}</label>
                  <button onClick={() => setIsLocked({...isLocked, [id]: !isLocked[id]})} style={{ border: 'none', background: 'none', color: '#3182F6', fontWeight: 'bold', cursor: 'pointer' }}>
                    {isLocked[id] ? '수정' : '확정'}
                  </button>
                </div>
                {isLocked[id] ?
                  <div style={{ padding: 14, background: '#F2F8FF', borderRadius: 12, fontWeight: 'bold', color: '#3182F6', lineHeight: 1.5 }}>
                    {goals[id] || '목표를 입력해 주세요'}
                  </div> :
                  <input className="goal-input" placeholder={field.placeholder} value={goals[id]} onChange={e => setGoals({...goals, [id]: e.target.value})} />
                }
              </div>
            );
          })}
        </div>

        <div className="section-title">✅ {selectedDate}의 행동 기록</div>
        <div className="card">
          <div className="progress-container"><div className="progress-bar" style={{ width: `${(cores.filter(Boolean).length / 10) * 100}%` }} /></div>
          <Spacing size={16} />
          {CORE_LIST.map((core, i) => (
            <div key={i} className="core-wrapper">
              <div className={`core-item ${cores[i] ? 'checked' : ''}`} onClick={() => toggleCore(i)}>
                <div className={`core-checkbox ${cores[i] ? 'checked' : ''}`} />
                <div className="core-text">{core}</div>
                {i === 5 && <input type="number" className="count-input" value={counts.demon} onChange={e => setCounts({...counts, demon: Number(e.target.value)})} onClick={e => e.stopPropagation()} />}
                {i === 6 && <input type="number" className="count-input" value={counts.stp} onChange={e => setCounts({...counts, stp: Number(e.target.value)})} onClick={e => e.stopPropagation()} />}
              </div>
              <input className="core-detail-input" placeholder={CORE_HINTS[i]} value={coreTexts[i]} onChange={e => {
                const nt = [...coreTexts]; nt[i] = e.target.value; setCoreTexts(nt);
              }} />
            </div>
          ))}
        </div>

        <div className="section-title">✍️ 메모 및 사진 노트 변환</div>
        <div className="card">
          <textarea placeholder="오늘의 피드백이나 감사일기를 적어보세요." value={memo} onChange={e => setMemo(e.target.value)} />

          <div className="ocr-section">
            <label className="btn-upload-photo">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden-file-input" />
              📸 책/노트 사진 촬영하고 텍스트로 변환하기
            </label>
            {photoUrl && <img src={photoUrl} alt="업로드된 노트" className="uploaded-photo" />}
            {isExtracting && <div className="ocr-loading">열심히 글자를 읽고 있습니다... ⏳</div>}
            {!isExtracting && extractedText && (
              <div className="extracted-text">
                <Text typography="t7" color={colors.grey600} fontWeight="bold">인식된 텍스트:</Text>
                <div style={{ marginTop: 8 }}>{extractedText}</div>
              </div>
            )}
          </div>

          <Spacing size={16} />
          <button className="share-btn" onClick={handleShare}>📺 광고 보고 1P 받으며 공유하기</button>
        </div>
      </div>
    </div>
  );
}

export default App;