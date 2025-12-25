import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, X } from 'lucide-react'
import { useTranslation } from '../../stores/languageStore'

export default function RestTimer({ isOpen, onClose, defaultSeconds = 90 }) {
  const { t } = useTranslation()
  const [seconds, setSeconds] = useState(defaultSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [initialTime, setInitialTime] = useState(defaultSeconds)
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    setSeconds(defaultSeconds)
    setInitialTime(defaultSeconds)
  }, [defaultSeconds])

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            playSound()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, seconds])

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err))
    }
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setSeconds(initialTime)
  }

  const adjustTime = (amount) => {
    setSeconds(prev => Math.max(0, prev + amount))
  }

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`
  }

  const progress = initialTime > 0 ? ((initialTime - seconds) / initialTime) * 100 : 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <audio ref={audioRef} src="/timer-beep.mp3" preload="auto" />
      
      <div className="bg-white rounded-lg max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-display text-olympus-navy">
            {t('restTimer')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {/* Circular Progress */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#D4AF37"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-5xl font-bold ${seconds <= 10 && seconds > 0 ? 'text-red-500 animate-pulse' : 'text-olympus-navy'}`}>
                {formatTime(seconds)}
              </span>
            </div>
          </div>

          {/* Quick Adjust Buttons */}
          <div className="flex justify-center space-x-2 mb-6">
            <button
              onClick={() => adjustTime(-15)}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition"
              disabled={isRunning}
            >
              -15s
            </button>
            <button
              onClick={() => adjustTime(-30)}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition"
              disabled={isRunning}
            >
              -30s
            </button>
            <button
              onClick={() => adjustTime(30)}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition"
              disabled={isRunning}
            >
              +30s
            </button>
            <button
              onClick={() => adjustTime(60)}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition"
              disabled={isRunning}
            >
              +1min
            </button>
          </div>

          {/* Control Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={toggleTimer}
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              <span>{isRunning ? t('pause') : t('start')}</span>
            </button>
            <button
              onClick={resetTimer}
              className="btn-secondary flex items-center justify-center px-4"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Preset Times */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">{t('presetTimes')}</p>
            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 90, 120, 180, 240, 300, 360].map(time => (
                <button
                  key={time}
                  onClick={() => {
                    setSeconds(time)
                    setInitialTime(time)
                    setIsRunning(false)
                  }}
                  className="px-3 py-2 text-sm bg-olympus-marble hover:bg-gray-200 rounded transition"
                  disabled={isRunning}
                >
                  {time < 60 ? `${time}s` : `${time / 60}m`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
