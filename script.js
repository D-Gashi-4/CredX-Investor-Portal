const activityList = document.getElementById('activityList');

if (activityList) {
  const items = [
    { date: 'Jun 15', label: 'North Ridge Logistics', amount: '+$1.2M', tone: 'positive' },
    { date: 'Jun 11', label: 'Portfolio rebalancing', amount: '-$420k', tone: 'negative' },
    { date: 'Jun 08', label: 'Green Harbor Energy', amount: '+$850k', tone: 'positive' },
    { date: 'Jun 04', label: 'Distribution payout', amount: '+$310k', tone: 'positive' },
  ];

  activityList.innerHTML = items
    .map(
      (item) => `
        <li>
          <span>${item.date}</span>
          <strong>${item.label}</strong>
          <em style="color: ${item.tone === 'positive' ? '#5ae7b5' : '#f7787b'};">${item.amount}</em>
        </li>
      `
    )
    .join('');
}
