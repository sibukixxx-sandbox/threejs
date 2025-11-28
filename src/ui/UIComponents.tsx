import React from 'react'
import './UIComponents.css'

/**
 * HUD (Heads-Up Display) コンポーネント
 * 各シーンの上部に表示される情報パネル
 */
interface HUDProps {
  title: string
  subtitle?: string
  icon?: string
  children?: React.ReactNode
}

export function HUD({ title, subtitle, icon, children }: HUDProps) {
  return (
    <div className="hud-container">
      <div className="hud-header">
        {icon && <span className="hud-icon">{icon}</span>}
        <div className="hud-title-group">
          <h1 className="hud-title">{title}</h1>
          {subtitle && <p className="hud-subtitle">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="hud-content">{children}</div>}
    </div>
  )
}

/**
 * StatCard - 統計情報カード
 */
interface StatCardProps {
  label: string
  value: string | number
  icon?: string
  color?: 'blue' | 'green' | 'red' | 'gold' | 'purple'
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ label, value, icon, color = 'blue', trend }: StatCardProps) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">
          {value}
          {trend && (
            <span className={`stat-trend stat-trend-${trend}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * StatusBadge - ステータスバッジ
 */
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'warning' | 'error' | 'success'
  label: string
  pulse?: boolean
}

export function StatusBadge({ status, label, pulse = false }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${status} ${pulse ? 'status-pulse' : ''}`}>
      <span className="status-dot"></span>
      {label}
    </span>
  )
}

/**
 * InfoPanel - 情報パネル
 */
interface InfoPanelProps {
  title: string
  children: React.ReactNode
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  collapsible?: boolean
}

export function InfoPanel({ title, children, position = 'bottom-right', collapsible = false }: InfoPanelProps) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className={`info-panel info-panel-${position} ${collapsed ? 'collapsed' : ''}`}>
      <div className="info-panel-header" onClick={() => collapsible && setCollapsed(!collapsed)}>
        <h3>{title}</h3>
        {collapsible && <span className="collapse-icon">{collapsed ? '▼' : '▲'}</span>}
      </div>
      {!collapsed && <div className="info-panel-body">{children}</div>}
    </div>
  )
}

/**
 * ActionButton - アクションボタン
 */
interface ActionButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  icon?: string
  disabled?: boolean
}

export function ActionButton({ label, onClick, variant = 'primary', icon, disabled = false }: ActionButtonProps) {
  return (
    <button className={`action-button action-button-${variant}`} onClick={onClick} disabled={disabled}>
      {icon && <span className="button-icon">{icon}</span>}
      {label}
    </button>
  )
}

/**
 * SceneSelector - シーン選択UI
 */
interface SceneSelectorProps {
  scenes: Array<{
    id: string
    name: string
    icon: string
    description: string
  }>
  currentScene: string
  onSceneChange: (sceneId: string) => void
}

export function SceneSelector({ scenes, currentScene, onSceneChange }: SceneSelectorProps) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className={`scene-selector ${expanded ? 'expanded' : ''}`}>
      <button className="scene-selector-toggle" onClick={() => setExpanded(!expanded)}>
        <span className="toggle-icon">🎬</span>
        <span className="toggle-text">Scenes</span>
      </button>
      {expanded && (
        <div className="scene-selector-menu">
          {scenes.map((scene) => (
            <div
              key={scene.id}
              className={`scene-option ${currentScene === scene.id ? 'active' : ''}`}
              onClick={() => {
                onSceneChange(scene.id)
                setExpanded(false)
              }}
            >
              <span className="scene-icon">{scene.icon}</span>
              <div className="scene-info">
                <div className="scene-name">{scene.name}</div>
                <div className="scene-description">{scene.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * LoadingSpinner - ローディングスピナー
 */
export function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  )
}

/**
 * Tooltip - ツールチップ
 */
interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  return (
    <div className="tooltip-wrapper">
      {children}
      <div className={`tooltip tooltip-${position}`}>{content}</div>
    </div>
  )
}
