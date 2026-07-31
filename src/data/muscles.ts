import { Muscle } from '../types';

export const muscles: Muscle[] = [
  { id: 'pectoralis-major', name: '胸大肌', nameEn: 'Pectoralis Major', region: 'chest', meshId: 'chest-main', description: '负责肩关节水平内收和屈曲，是推类动作的核心', defaultColor: '#F5D0A9' },
  { id: 'latissimus-dorsi', name: '背阔肌', nameEn: 'Latissimus Dorsi', region: 'back', meshId: 'back-lats', description: '负责肩关节内收和伸展，是拉类动作的核心', defaultColor: '#F5D0A9' },
  { id: 'trapezius', name: '斜方肌', nameEn: 'Trapezius', region: 'back', meshId: 'back-traps', description: '负责肩胛骨上提、后缩和下沉', defaultColor: '#F5D0A9' },
  { id: 'erector-spinae', name: '竖脊肌', nameEn: 'Erector Spinae', region: 'back', meshId: 'back-erectors', description: '维持脊柱直立，负责脊柱后伸', defaultColor: '#F5D0A9' },
  { id: 'deltoid-front', name: '三角肌前束', nameEn: 'Anterior Deltoid', region: 'shoulder', meshId: 'shoulder-front', description: '负责肩关节屈曲和内旋', defaultColor: '#F5D0A9' },
  { id: 'deltoid-middle', name: '三角肌中束', nameEn: 'Lateral Deltoid', region: 'shoulder', meshId: 'shoulder-mid', description: '负责肩关节外展', defaultColor: '#F5D0A9' },
  { id: 'deltoid-rear', name: '三角肌后束', nameEn: 'Posterior Deltoid', region: 'shoulder', meshId: 'shoulder-rear', description: '负责肩关节水平外展', defaultColor: '#F5D0A9' },
  { id: 'biceps', name: '肱二头肌', nameEn: 'Biceps Brachii', region: 'arm', meshId: 'arm-biceps', description: '负责肘关节屈曲和前臂旋后', defaultColor: '#F5D0A9' },
  { id: 'triceps', name: '肱三头肌', nameEn: 'Triceps Brachii', region: 'arm', meshId: 'arm-triceps', description: '负责肘关节伸展', defaultColor: '#F5D0A9' },
  { id: 'forearms', name: '前臂肌群', nameEn: 'Forearms', region: 'arm', meshId: 'arm-forearms', description: '负责腕关节和手指运动，握力来源', defaultColor: '#F5D0A9' },
  { id: 'rectus-abdominis', name: '腹直肌', nameEn: 'Rectus Abdominis', region: 'core', meshId: 'core-abs', description: '负责脊柱屈曲，使躯干向前弯曲', defaultColor: '#F5D0A9' },
  { id: 'obliques', name: '腹外斜肌', nameEn: 'External Obliques', region: 'core', meshId: 'core-obliques', description: '负责躯干旋转和侧屈', defaultColor: '#F5D0A9' },
  { id: 'quadriceps', name: '股四头肌', nameEn: 'Quadriceps', region: 'leg', meshId: 'leg-quads', description: '负责膝关节伸展，是下肢推类动作核心', defaultColor: '#F5D0A9' },
  { id: 'hamstrings', name: '腘绳肌', nameEn: 'Hamstrings', region: 'leg', meshId: 'leg-hams', description: '负责膝关节屈曲和髋关节伸展', defaultColor: '#F5D0A9' },
  { id: 'glutes', name: '臀大肌', nameEn: 'Gluteus Maximus', region: 'leg', meshId: 'leg-glutes', description: '负责髋关节伸展和外旋', defaultColor: '#F5D0A9' },
  { id: 'calves', name: '小腿肌群', nameEn: 'Calves', region: 'leg', meshId: 'leg-calves', description: '负责踝关节跖屈（提踵）', defaultColor: '#F5D0A9' },
];
