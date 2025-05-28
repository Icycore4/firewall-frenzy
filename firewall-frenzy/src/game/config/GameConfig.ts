export const GameConfig = {
  WIDTH: 1280,
  HEIGHT: 720,
  
  // Game constants
  TILES: {
    WIDTH: 64,
    HEIGHT: 64
  },
  
  // Resource constants
  CPU_CYCLES: {
    BASE_INCOME: 10,
    TOWER_COST: {
      FIREWALL: 50,
      ANTIVIRUS: 75,
      PACKET_SCRUBBER: 100,
      AI_SENTRY: 150
    }
  },
  
  // Enemy constants
  ENEMY_TYPES: {
    VIRUS: 'virus',
    WORM: 'worm',
    TROJAN: 'trojan',
    RANSOMWARE: 'ransomware'
  },
  
  // Tower constants
  TOWER_TYPES: {
    FIREWALL: 'firewall',
    ANTIVIRUS: 'antivirus',
    PACKET_SCRUBBER: 'packet-scrubber',
    AI_SENTRY: 'ai-sentry'
  }
};
