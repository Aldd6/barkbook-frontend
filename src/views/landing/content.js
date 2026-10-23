import {
  cilBath,
  cilBed,
  cilCalendarCheck,
  cilCreditCard,
  cilEnvelopeClosed,
  cilFootball,
  cilHeart,
  cilLocationPin,
  cilClock,
  cilPaw,
  cilPhone,
  cilRestaurant,
  cilShieldAlt,
  cilSnowflake,
  cilSpa,
  cilUserPlus,
  cilVideo,
  cilVolumeOff,
} from '@coreui/icons'


export const HERO = {
  eyebrow: 'Hotel para perros y gatos',
  title: 'Vacaciones para ellos,',
  highlight: 'tranquilidad para ti',
  text: 'Hospedaje con cariño, juegos y cuidadores atentos las 24 horas. Reserva en línea, sigue la estancia de tu mascota y agrega servicios cuando quieras.',
  badges: [
    { icon: cilVideo, label: 'Cámaras 24/7' },
    { icon: cilHeart, label: 'Cuidadores expertos' },
    { icon: cilPaw, label: 'Perros y gatos' },
  ],
}

export const HIGHLIGHTS = [
  { icon: cilShieldAlt, title: 'Estancia segura', text: 'Verificamos el carné de vacunación de cada huésped al llegar.' },
  { icon: cilCreditCard, title: 'Paga como prefieras', text: 'Con tarjeta al reservar o en recepción dentro de los 5 días siguientes.' },
  { icon: cilCalendarCheck, title: 'Reserva en minutos', text: 'Elige la sede, la habitación y las fechas desde tu cuenta.' },
  { icon: cilSpa, title: 'Servicios a la carta', text: 'Baños, paseos y comidas especiales durante la estancia.' },
]

export const SERVICES = [
  {
    icon: cilBath,
    title: 'Aseo',
    text: 'Baño, cepillado y corte de uñas para que vuelvan a casa oliendo a nuevo.',
    color: '#ff9505',
  },
  {
    icon: cilFootball,
    title: 'Recreación',
    text: 'Paseos, juegos en grupo y tiempo en el patio según la energía de cada uno.',
    color: '#cc5803',
  },
  {
    icon: cilRestaurant,
    title: 'Alimentación',
    text: 'Respetamos su dieta y horarios, o le preparamos un menú especial.',
    color: '#582b11',
  },
]

export const ROOMS = [
  {
    name: 'Estándar Canina',
    species: 'Perros',
    price: 'Desde Q250 / noche',
    text: 'Espacio cómodo y ventilado para descansar después de un día de juegos.',
    features: [
      { icon: cilBed, label: 'Cama ortopedica' },
      { icon: cilFootball, label: 'Patio compartido' },
    ],
  },
  {
    name: 'Suite Canina',
    species: 'Perros',
    price: 'Desde Q500 / noche',
    text: 'Nuestra habitación más amplia, con patio privado y todas las comodidades.',
    featured: true,
    features: [
      { icon: cilSnowflake, label: 'Aire acondicionado' },
      { icon: cilBed, label: 'Cama ortopédica' },
      { icon: cilVideo, label: 'Cámara' },
      { icon: cilVolumeOff, label: 'Insonorizada' },
    ],
  },
  {
    name: 'Suite felina',
    species: 'Gatos',
    price: 'Desde Q650 / noche',
    text: 'Un espacio tranquilo, con alturas para trepar y lejos de los ladridos.',
    features: [
      { icon: cilVolumeOff, label: 'Insonorizada' },
      { icon: cilPaw, label: 'Juguetes' },
      { icon: cilBed, label: 'Cama ortopédica' },
      { icon: cilVolumeOff , label: 'Insonorizada' }
    ],
  },
]

export const STEPS = [
  { icon: cilUserPlus, title: 'Crea tu cuenta', text: 'Regístrate y agrega los datos y el carné de vacunación de tu mascota.' },
  { icon: cilCalendarCheck, title: 'Reserva', text: 'Elige sede, habitación y fechas. Paga con tarjeta o en recepción.' },
  { icon: cilPaw, title: 'Llegada', text: 'En el check-in conocemos a tu mascota y le asignamos su habitación.' },
  { icon: cilSpa, title: 'Disfruta', text: 'Desde tu cuenta solicita servicios extra mientras está con nosotros.' },
]

export const FAQ = [
  {
    question: '¿Qué necesita mi mascota para hospedarse?',
    answer: 'Su carné de vacunación al día y sus datos básicos registrados en tu cuenta. En el check-in revisamos que todo esté en orden.',
  },
  {
    question: '¿Cómo pago mi reserva?',
    answer:
      'Puedes pagar con tarjeta al reservar y la reserva queda confirmada al instante. También puedes pagar en recepción dentro de los 5 días siguientes; si no se paga en ese plazo, se cancela automáticamente.',
  },
  {
    question: '¿Puedo cancelar?',
    answer:
      'Sí, antes de la fecha de entrada puedes solicitar la cancelación desde el detalle de tu reserva. Recepción la revisa y, al confirmarla, se te reembolsa lo pagado.',
  },
  {
    question: '¿Cómo se cobran los servicios extra?',
    answer: 'Los solicitas desde tu cuenta durante la estancia. Se cargan a la cuenta cuando el cuidador los completa y se pagan en recepción al recoger a tu mascota.',
  },
]

export const CONTACT = {
  items: [
    { icon: cilPhone, label: '+502 1234 5678' },
    { icon: cilEnvelopeClosed, label: 'hola@guauymiau.com' },
    { icon: cilLocationPin, label: 'Ciudad de Guatemala' },
    { icon: cilClock, label: 'Lunes a domingo, 7:00 a 19:00' },
  ],
}
