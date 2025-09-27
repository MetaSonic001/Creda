export default function getCardSize(item: { image: string; link: string }) {
  if (item.image && item.link) {
    console.log('large');
    return 'large';
  } else if (item.image && !item.link) {
    console.log('medium');
    return 'medium';
  } else {
    console.log('small');
    return 'small';
  }
}
