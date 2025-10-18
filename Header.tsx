import Header from '../Header'

export default function HeaderExample() {
  return (
    <div className="space-y-3">
      <Header 
        title="River Park"
        notificationCount={3}
        onMenuClick={() => console.log('Menu clicked')}
        onNotificationClick={() => console.log('Notifications clicked')}
      />
      <Header 
        title="Мои счета"
        onMenuClick={() => console.log('Menu clicked')}
        onNotificationClick={() => console.log('Notifications clicked')}
      />
    </div>
  )
}
