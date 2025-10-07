# Cyberpunk Oregon Trail - Visual Design Document

## Design Philosophy

### Terminal Aesthetic
- **Retro Computing Nostalgia**: Authentic 1980s CRT terminal experience
- **Cyberpunk Atmosphere**: High-tech, low-life dystopian mood
- **Minimalist Interface**: Text-only design with strategic visual effects
- **Immersive Experience**: Player feels like they're using an actual terminal

### Color Palette
- **Primary**: Neon green (#00FF00) - classic terminal phosphor green
- **Secondary**: Electric cyan (#00FFFF) - for highlights and alerts  
- **Accent**: Hot pink (#FF00FF) - for critical warnings and danger
- **Background**: Deep black (#000000) - pure terminal darkness
- **Text Variants**: 
  - Bright green (#00FF41) for active text
  - Dim green (#007700) for secondary information
  - Amber (#FFB000) for system messages

### Typography
- **Primary Font**: 'Courier New', monospace - authentic terminal typeface
- **Fallback**: 'Lucida Console', 'Monaco', monospace
- **Font Sizes**: 
  - Main text: 14px for readability
  - Headers: 18px for emphasis
  - Status info: 12px for compact display
- **Text Effects**: 
  - Character glow for active elements
  - Subtle flicker simulation
  - Typewriter animation for narrative immersion

## Visual Effects

### Terminal Styling
- **CRT Monitor Simulation**: Subtle curvature and bezel effect
- **Scanline Overlay**: Horizontal lines mimicking CRT refresh
- **Phosphor Glow**: Soft green glow around bright text
- **Screen Burn**: Subtle ghosting effects on static elements

### Animation Effects
- **Typewriter Text**: Characters appear one by one with slight delay
- **Cursor Blink**: Traditional terminal cursor with steady pulse
- **Glitch Effects**: Occasional digital corruption for cyberpunk feel
- **Static Interference**: Brief screen static during dramatic moments

### Interactive Elements
- **Button Hover**: Text brightens and glows on mouse over
- **Command Input**: Pulsing cursor with input highlighting
- **Status Updates**: Smooth transitions between game states
- **Error Messages**: Red text with shake animation for invalid commands

## Layout Structure

### Main Terminal Window
- **Full Screen**: Black background filling entire viewport
- **Fixed Aspect**: Maintains terminal proportions on all screens
- **Border Effect**: Subtle green border mimicking monitor bezel

### Content Areas
- **Header Zone**: Game title and system status (top)
- **Main Display**: Primary game text and narrative (center)
- **Status Panel**: Resources, team health, progress (right side)
- **Command Line**: Input area with prompt (bottom)

### Responsive Design
- **Desktop**: Full terminal experience with all panels visible
- **Tablet**: Collapsible side panels for main content focus
- **Mobile**: Single-column layout with swipe navigation

## Cyberpunk Theming

### Visual Motifs
- **Digital Rain**: Occasional Matrix-style falling characters in background
- **Circuit Patterns**: Subtle geometric overlays suggesting circuitry
- **Neon Accents**: Strategic use of bright colors against dark background
- **Glitch Aesthetics**: Intentional digital artifacts and corruption effects

### Atmospheric Elements
- **Ambient Glow**: Soft neon haze around interface elements
- **Shadow Depth**: Multiple layers creating depth and dimension
- **Contrast Play**: Extreme light/dark relationships
- **Futuristic Minimalism**: Clean lines with technological edge

## User Experience Design

### Accessibility Features
- **High Contrast**: Strong color differences for readability
- **Large Text**: Clear, legible font sizes
- **Keyboard Navigation**: Full game control via keyboard
- **Visual Feedback**: Clear responses to all user actions

### Interaction Patterns
- **Command Line Interface**: Authentic terminal command input
- **Menu Systems**: Numbered options for easy selection
- **Status Indicators**: Clear visual representation of game state
- **Progress Tracking**: Visual journey map and milestone markers

## Technical Implementation

### CSS Effects
- **Text Shadow**: Multiple layers for glow effects
- **Box Shadow**: Subtle depth and lighting
- **Animations**: CSS keyframes for smooth motion
- **Transitions**: State changes with visual feedback

### JavaScript Integration
- **Dynamic Styling**: Real-time CSS modifications
- **Event Handling**: Smooth interaction responses
- **Animation Control**: Coordinated visual effects
- **State Management**: Consistent visual theming throughout gameplay