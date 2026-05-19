import React, { useState, useEffect } from 'react';
import { Text, Spacing } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import Tesseract from 'tesseract.js';
import { showFullScreenAd } from '@apps-in-toss/web-framework';
import './App.css';

const CORE_LIST = [
  "💪 1. 체력단련", "📚 2. 책 읽기", "🎧 3. 음원듣기 (성공자)", "🤝 4. 미팅 참석", "🛍️ 5. 100%제품애용",
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
  const timezoneOffset = dateObj.getTimezoneOffset() * 60000;
  const localDate = new Date(dateObj.getTime() - timezoneOffset);
  const todayStr = localDate.toISOString().split('T')[0];

  useEffect(() => {
    document.title = '성공일기10코어';
  }, []);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showCalendar, setShowCalendar] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [userName, setUserName] = useState('');

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);

  const [isMonthlyScheduleModalOpen, setIsMonthlyScheduleModalOpen] = useState(false);
  const [monthlySchedules, setMonthlySchedules] = useState<{date: string, schedule: string}[]>([]);

  // 🚀 월간 일정표 이미지 뷰어 상태
  const [monthlyScheduleImage, setMonthlyScheduleImage] = useState<string | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const [goals, setGoals] = useState({ dream: '', fiveYears: '', month: '', day: '' });
  const [isLocked, setIsLocked] = useState({ dream: false, fiveYears: false, month: false, day: false });
  const [cores, setCores] = useState<boolean[]>(Array(10).fill(false));
  const [coreTexts, setCoreTexts] = useState<string[]>(Array(10).fill(''));
  const [counts, setCounts] = useState({ demon: 0, stp: 0 });
  const [memo, setMemo] = useState('');
  const [schedule, setSchedule] = useState('');

  const [points, setPoints] = useState(0);
  const [rank, setRank] = useState('도전자');
  const [shareStreak, setShareStreak] = useState(0);
  const [lastShareDate, setLastShareDate] = useState('');

  const [history, setHistory] = useState<Record<string, number>>({});
  const [countsHistory, setCountsHistory] = useState<Record<string, { demon: number, stp: number }>>({});

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  // 🚀 이달의 일정표 이미지를 월 변경 시마다 새로 불러옴
  useEffect(() => {
    const savedImg = localStorage.getItem(`success_monthly_schedule_image_${currentMonthPrefix}`);
    setMonthlyScheduleImage(savedImg ? savedImg : null);
  }, [currentMonthPrefix]);

  useEffect(() => {
    const savedUserName = localStorage.getItem('success_user_name');
    if (savedUserName) setUserName(savedUserName);

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
    const savedSchedule = localStorage.getItem(`success_schedule_${selectedDate}`);

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
    setSchedule(savedSchedule ? savedSchedule : '');
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
    try {
      const isNotificationSupported = 'Notification' in window;
      if (isNotificationSupported) {
        if (window.Notification.permission !== 'granted' && window.Notification.permission !== 'denied') {
          window.Notification.requestPermission().catch(e => console.warn("알림 권한 요청 실패:", e));
        }
      }

      const checkTimeAndNotify = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const targetHours = [7, 9, 13, 17];

        if (targetHours.includes(hours) && minutes === 0) {
          const lastNotified = localStorage.getItem('success_last_notified_time');
          const currentTimeStr = `${hours}:${minutes}`;

          if (lastNotified !== currentTimeStr) {
            const timezoneOffset = now.getTimezoneOffset() * 60000;
            const localDate = new Date(now.getTime() - timezoneOffset);
            const todayStr = localDate.toISOString().split('T')[0];

            const todaySchedule = localStorage.getItem(`success_schedule_${todayStr}`);
            const messageBody = todaySchedule ? `오늘의 일정: ${todaySchedule}` : '오늘의 일정을 등록하고 10코어를 실천하세요!';

            if (isNotificationSupported && window.Notification.permission === 'granted') {
              new window.Notification('성공일기10코어 ⏰', {
                body: messageBody,
                icon: 'https://cdn-icons-png.flaticon.com/512/825/825590.png'
              });
            } else {
              alert(`[알림] 성공일기10코어 ⏰\n${messageBody}`);
            }
            localStorage.setItem('success_last_notified_time', currentTimeStr);
          }
        }
      };

      const intervalId = setInterval(checkTimeAndNotify, 60000);
      checkTimeAndNotify();
      return () => clearInterval(intervalId);
    } catch (error) {
      console.warn("알림 기능 충돌 방어 성공:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('success_user_name', userName);
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
    localStorage.setItem(`success_schedule_${selectedDate}`, schedule);

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
  }, [userName, goals, isLocked, cores, coreTexts, counts, memo, schedule, points, rank, shareStreak, lastShareDate, photoUrl, extractedText, selectedDate]);

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

  // 🚀 월간 일정표 이미지 업로드 핸들러
  const handleMonthlyImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      try {
        localStorage.setItem(`success_monthly_schedule_image_${currentMonthPrefix}`, result);
        setMonthlyScheduleImage(result);
      } catch (error) {
        alert('이미지 용량이 너무 큽니다. 화면을 캡처하여 작은 용량으로 다시 올려주세요.');
      }
    };
    reader.readAsDataURL(file);
  };

  // 🚀 월간 일정표 이미지 삭제 핸들러
  const handleDeleteMonthlyImage = () => {
    if(window.confirm('등록된 월간 일정표 이미지를 삭제하시겠습니까?')) {
      localStorage.removeItem(`success_monthly_schedule_image_${currentMonthPrefix}`);
      setMonthlyScheduleImage(null);
    }
  };

  const handleShare = async () => {
    let newStreak = shareStreak;
    let isStreakIncreased = false;

    if (lastShareDate !== todayStr) {
      if (lastShareDate) {
        const lastDate = new Date(lastShareDate);
        const currDate = new Date(todayStr);
        const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          newStreak += 1;
          isStreakIncreased = true;
        } else {
          newStreak = 1;
          isStreakIncreased = true;
        }
      } else {
        newStreak = 1;
        isStreakIncreased = true;
      }
    }

    let bonusPoints = 0;
    let newRank = rank;

    if (isStreakIncreased) {
      if (newStreak === 30) { newRank = '브론즈'; bonusPoints = 30; }
      else if (newStreak === 100) { newRank = 'SP'; bonusPoints = 100; }
      else if (newStreak === 200) { newRank = '사파이어'; bonusPoints = 200; }
      else if (newStreak === 300) { newRank = '에메랄드'; bonusPoints = 300; }
      else if (newStreak === 500) { newRank = '다이아몬드'; bonusPoints = 1000; }
    }

    setShareStreak(newStreak);
    setLastShareDate(todayStr);
    setRank(newRank);
    setPoints(p => p + 1 + bonusPoints);

    localStorage.setItem('success_streak', newStreak.toString());
    localStorage.setItem('success_last_share', todayStr);
    localStorage.setItem('success_rank', newRank);

    const completedCount = cores.filter(Boolean).length;
    const dynamicStreakMessage = getStreakMessage(newStreak);
    const shareText = `🌟 [성공일기10코어] 🌟\n👤 리더: ${userName || '이름없음'}\n📅 날짜: ${selectedDate}\n🔥 오늘 달성: ${completedCount}/10\n${dynamicStreakMessage}\n👑 현재 직급: ${newRank}\n📊 월 누적 달성률: ${monthProgressPercent}%\n🚀 월 누적 STP: ${monthStpTotal}회\n👥 월 누적 데몬: ${monthDemonTotal}회`;

    try {
      if (navigator.share) {
        await navigator.share({ title: '성공일기10코어', text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert("내용이 복사되었습니다! 카카오톡에 붙여넣기 해보세요. 📋");
      }
    } catch (err) {
      console.warn("공유를 취소했거나 에러 발생:", err);
    }

    const showRewardAlert = () => {
      setTimeout(() => {
        if (bonusPoints > 0) {
          alert(`🎉 기적을 만들고 계십니다! 연속 ${newStreak}일 달성!\n[${newRank}] 승급 및 ${bonusPoints}P 보너스가 지급되었습니다! 💎💎💎`);
        } else if (isStreakIncreased) {
          alert(`🎉 1% 성장 완료! 기본 1포인트 지급 (현재 연속 ${newStreak}일째 🔥)`);
        } else {
          alert(`🎉 오늘의 공유를 완료했습니다! (현재 연속 ${newStreak}일째 🔥)`);
        }
      }, 500);
    };

    try {
      if (typeof showFullScreenAd !== 'undefined' && showFullScreenAd.isSupported && showFullScreenAd.isSupported()) {
        await showFullScreenAd({ adGroupId: 'ait.v2.live.4085991e9d3d489b' });
        showRewardAlert();
      } else {
        await showFullScreenAd({ adGroupId: 'ait.v2.live.4085991e9d3d489b' });
        showRewardAlert();
      }
    } catch (adError) {
      console.warn("광고 시스템 로드 실패. 앱 멈춤 방지를 위해 바로 넘어갑니다:", adError);
      showRewardAlert();
    }
  };

  const handleMonthClick = () => {
    const schedules = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const savedSchedule = localStorage.getItem(`success_schedule_${dateStr}`);
      if (savedSchedule && savedSchedule.trim() !== '') {
        schedules.push({ date: dateStr, schedule: savedSchedule.trim() });
      }
    }
    setMonthlySchedules(schedules);
    setIsMonthlyScheduleModalOpen(true);
  };

  const handleShareMonthlySchedule = async () => {
    if (monthlySchedules.length === 0) {
      alert("공유할 일정이 없습니다.");
      return;
    }

    let shareText = `📅 [${currentYear}년 ${currentMonth + 1}월 전체 일정]\n\n`;
    monthlySchedules.forEach(item => {
      shareText += `📌 ${item.date}\n${item.schedule}\n\n`;
    });

    try {
      if (navigator.share) {
        await navigator.share({ title: '월간 일정 공유', text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert("월간 일정이 복사되었습니다! 카카오톡에 붙여넣기 해보세요. 📋");
      }
    } catch (err) {
      console.warn("월간 일정 공유 에러:", err);
    }
  };

  const handlePrevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

  const renderCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const count = history[dateStr] || 0;
      const isSelected = dateStr === selectedDate;
      const hasSchedule = localStorage.getItem(`success_schedule_${dateStr}`);

      days.push(
        <div
          key={d}
          onClick={() => {
            setSelectedDate(dateStr);
            setIsScheduleModalOpen(true);
          }}
          style={{ cursor: 'pointer' }}
          className={`calendar-day active ${count === 10 ? 'completed' : ''} ${isSelected ? 'selected' : ''}`}
        >
          {d}
          {(count > 0 || hasSchedule) && <div className="calendar-dot" style={{ backgroundColor: count > 0 ? '#3182F6' : '#FF7043' }} />}
        </div>
      );
    }
    return days;
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 500) return `🎉 You can do it! 다이아몬드 도전 중 (연속 ${streak}일째)`;
    if (streak >= 300) return `🎉 You can do it! 에메랄드 도전 중 (연속 ${streak}일째)`;
    if (streak >= 100) return `🎉 You can do it! 사파이어 도전 중 (연속 ${streak}일째)`;
    if (streak >= 30) return `🎉 You can do it! SP 도전 중 (연속 ${streak}일째)`;
    return `🔥 멈추지 않는 열정! 연속 공유 ${streak}일째 진행 중`;
  };

  return (
    <div className="toss-wrapper">
      <div className="toss-container">
        <header className="header" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Text typography="t3" fontWeight="bold">성공일기10코어 🔥</Text>
            <div className="header-badges">
              <div
                className="rank-badge"
                onClick={() => {
                  const input = window.prompt("당신의 이름을 입력해주세요!", userName);
                  if (input !== null) setUserName(input.trim());
                }}
                style={{ cursor: 'pointer' }}
              >
                  👑 {userName ? userName : `이름 입력 (${rank})`}
              </div>
              <div className="points-badge">💎 {points} P</div>
            </div>
          </div>
          <div className="streak-text" style={{ color: shareStreak >= 30 ? '#F04452' : '#3182F6', fontSize: shareStreak >= 30 ? '14px' : '13px' }}>
            {getStreakMessage(shareStreak)}
          </div>
        </header>

        <div className="app-description">
          <span>🎯 성공일기10코어란?</span>
          매일 1%씩 성장하는 리더들을 위한 10코어 비즈니스 다이어리입니다. 하루하루의 꾸준한 실천 기록이 모여 다이아몬드의 기적을 만듭니다.
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{monthCoresDone}개</div><div className="stat-label">이번 달 코어 실천</div></div>
          <div className="stat-card"><div className="stat-value">{monthProgressPercent}%</div><div className="stat-label">이번 달 전체 달성률</div></div>
          <div className="stat-card"><div className="stat-value">{monthStpTotal}회</div><div className="stat-label">이번 달 누적 STP</div></div>
          <div className="stat-card"><div className="stat-value">{monthDemonTotal}회</div><div className="stat-label">이번 달 누적 데몬</div></div>
        </div>

        <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🗓️ 성공 달력 예약 및 확인</span>
          <button className="toggle-btn" onClick={() => setShowCalendar(!showCalendar)}>
            {showCalendar ? '접기 🔼' : '펼치기 🔽'}
          </button>
        </div>

        {showCalendar && (
          <div className="calendar-card">
            <div className="calendar-header">
              <button className="calendar-nav-btn" onClick={handlePrevMonth}>&lt;</button>
              <div
                className="calendar-current-month"
                onClick={handleMonthClick}
                style={{ cursor: 'pointer', padding: '4px 12px', borderRadius: '8px', background: '#F2F8FF', color: '#3182F6', border: '1px solid #D1E4FF' }}
              >
                {currentYear}년 {currentMonth + 1}월 🔍
              </div>
              <button className="calendar-nav-btn" onClick={handleNextMonth}>&gt;</button>
            </div>
            <div className="calendar-grid">
              {['일','월','화','수','목','금','토'].map(d => <div key={d} className="calendar-day-label">{d}</div>)}
              {renderCalendar()}
            </div>
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#8B95A1', marginTop: '16px' }}>
              💡 터치하여 하루 일정 관리 | 월 텍스트(🔍)를 눌러 전체 일정 모아보기
            </div>
          </div>
        )}

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

        <div className="section-title">✅ {selectedDate}의 10코어 점검</div>
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

        <div className="section-title">✍️ 내일 할 일 및 메모</div>
        <div className="card">
          <textarea placeholder="내일 달성할 핵심 업무 3가지나 피드백을 적어보세요." value={memo} onChange={e => setMemo(e.target.value)} />

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
          <button className="share-btn" onClick={handleShare}>📺 1%성장 공유하기</button>

          <button
            className="share-btn"
            onClick={() => setIsShopModalOpen(true)}
            style={{ marginTop: '12px', backgroundColor: '#191F28' }}
          >
            🎁 모은 포인트로 기프티콘 교환하기 (현재 {points}P)
          </button>
        </div>

        {/* 📅 일간 일정 관리 팝업 */}
        {isScheduleModalOpen && (
          <div className="modal-overlay" onClick={() => setIsScheduleModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">📅 {selectedDate} 일정 및 약속</div>
              <textarea
                placeholder="예: 14:00 강남 스폰서 미팅, 16:00 파트너 데몬 약속"
                value={schedule}
                onChange={e => setSchedule(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '150px',
                  border: '1px solid #E5E8EB',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '15px',
                  outline: 'none',
                  resize: 'none',
                  marginBottom: '0'
                }}
              />
              <button className="btn-save" onClick={() => setIsScheduleModalOpen(false)}>저장 및 닫기</button>
            </div>
          </div>
        )}

        {/* 🚀 월간 일정 팝업 (이미지 업로드 & 뷰어 기능 탑재) */}
        {isMonthlyScheduleModalOpen && (
          <div className="modal-overlay" onClick={() => setIsMonthlyScheduleModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="modal-header">📅 {currentYear}년 {currentMonth + 1}월 전체 일정</div>

              {/* 🚀 월간 일정표 이미지 관리 영역 */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333D4B' }}>📸 이달의 스케줄표 (이미지)</div>
                  {monthlyScheduleImage && (
                    <button onClick={handleDeleteMonthlyImage} style={{ background: 'none', border: 'none', color: '#F04452', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>삭제</button>
                  )}
                </div>

                {!monthlyScheduleImage ? (
                  <label className="btn-upload-photo" style={{ background: '#F2F8FF', color: '#3182F6', border: '1px dashed #3182F6', fontWeight: 'bold', padding: '12px', borderRadius: '12px' }}>
                    <input type="file" accept="image/*" onChange={handleMonthlyImageUpload} className="hidden-file-input" />
                    + 일정표 사진 등록하기
                  </label>
                ) : (
                  <div>
                    <img
                      src={monthlyScheduleImage}
                      alt="월간 일정표"
                      style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '12px', cursor: 'pointer', border: '1px solid #E5E8EB' }}
                      onClick={() => setIsImageViewerOpen(true)}
                    />
                    <div style={{ fontSize: '11px', color: '#8B95A1', textAlign: 'center', marginTop: '6px' }}>
                      💡 팁: 이미지를 터치하면 원본 크기로 확대됩니다.
                    </div>
                  </div>
                )}
              </div>

              {/* 월간 텍스트 일정 리스트 */}
              {monthlySchedules.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333D4B', marginTop: '10px' }}>📝 개별 일정 리스트</div>
                  {monthlySchedules.map((item, idx) => (
                    <div key={idx} style={{ background: '#F9FAFB', padding: '12px', borderRadius: '12px', border: '1px solid #E5E8EB' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#3182F6', marginBottom: '4px' }}>📌 {item.date}</div>
                      <div style={{ fontSize: '14px', color: '#191F28', whiteSpace: 'pre-wrap' }}>{item.schedule}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button
                  className="btn-save"
                  onClick={() => setIsMonthlyScheduleModalOpen(false)}
                  style={{ background: '#F2F4F6', color: '#4E5968', marginTop: 0 }}
                >
                  닫기
                </button>
                <button
                  className="btn-save"
                  onClick={handleShareMonthlySchedule}
                  style={{ marginTop: 0 }}
                >
                  텍스트 일정 📤
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🚀 팝업 위에 뜨는 전체화면 이미지 뷰어 */}
        {isImageViewerOpen && monthlyScheduleImage && (
          <div className="modal-overlay" onClick={() => setIsImageViewerOpen(false)} style={{ zIndex: 9999, padding: 0 }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.9)' }}>
              <img src={monthlyScheduleImage} alt="월간 일정표 원본" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              <button
                onClick={() => setIsImageViewerOpen(false)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {isShopModalOpen && (
          <div className="modal-overlay" onClick={() => setIsShopModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">🎁 10코어 포인트 상점</div>
              <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7684', marginBottom: '20px' }}>
                열심히 모은 1% 성장 포인트로<br/>진짜 보상을 받아가세요!
              </p>

              <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E5E8EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>☕ 스타벅스 아메리카노</div>
                  <div style={{ fontSize: '13px', color: '#3182F6', fontWeight: 'bold', marginTop: '4px' }}>4,500 P</div>
                </div>
                <button
                  style={{ background: points >= 4500 ? '#3182F6' : '#D1D6DB', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: points >= 4500 ? 'pointer' : 'not-allowed' }}
                  onClick={() => {
                    if (points >= 4500) {
                      alert("☕ 교환 신청이 완료되었습니다! (관리자 확인 후 지급됩니다)");
                      setPoints(prev => prev - 4500);
                    } else {
                      alert("포인트가 부족합니다. 매일 10코어를 공유하고 포인트를 모아보세요!");
                    }
                  }}
                >
                  교환
                </button>
              </div>

              <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E5E8EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>🍗 BHC 뿌링클 세트</div>
                  <div style={{ fontSize: '13px', color: '#3182F6', fontWeight: 'bold', marginTop: '4px' }}>20,000 P</div>
                </div>
                <button
                  style={{ background: points >= 20000 ? '#3182F6' : '#D1D6DB', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: points >= 20000 ? 'pointer' : 'not-allowed' }}
                  onClick={() => {
                    if (points >= 20000) {
                      alert("🍗 치킨 교환 신청이 완료되었습니다! (관리자 확인 후 지급됩니다)");
                      setPoints(prev => prev - 20000);
                    } else {
                      alert("포인트가 부족합니다. 10코어를 계속 실천하세요!");
                    }
                  }}
                >
                  교환
                </button>
              </div>

              <button className="btn-save" onClick={() => setIsShopModalOpen(false)}>닫기</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;