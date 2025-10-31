// SVG иконки для карты
const svgIcons = {
    // Камера - кружок с точкой внутри
    camera: `
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#4A90E2" stroke="#2C6FB7" stroke-width="2"/>
            <circle cx="12" cy="12" r="4" fill="#FFFFFF"/>
        </svg>
    `,
    
    // Камера выделенная
    camera_selected: `
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#FF6B6B" stroke="#FF4444" stroke-width="2"/>
            <circle cx="12" cy="12" r="4" fill="#FFFFFF"/>
        </svg>
    `,
    
    // POE коробка - квадрат с крестиком
    box: `
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="16" height="16" rx="2" fill="#333333" stroke="#000000" stroke-width="2"/>
            <path d="M12 8 L12 16 M8 12 L16 12" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `,
    
    // POE коробка выделенная
    box_selected: `
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="16" height="16" rx="2" fill="#FF6B6B" stroke="#FF4444" stroke-width="2"/>
            <path d="M12 8 L12 16 M8 12 L16 12" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `,
    
    // Оптическая коробка - шестиугольник
    optical: `
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4 L18 8 L18 16 L12 20 L6 16 L6 8 Z" fill="#FF4444" stroke="#CC0000" stroke-width="2"/>
            <circle cx="12" cy="12" r="2" fill="#FFFFFF"/>
        </svg>
    `,
    
    // Оптическая коробка выделенная
    optical_selected: `
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4 L18 8 L18 16 L12 20 L6 16 L6 8 Z" fill="#FF6B6B" stroke="#FF4444" stroke-width="2"/>
            <circle cx="12" cy="12" r="2" fill="#FFFFFF"/>
        </svg>
    `,
    
    // Столб - вертикальный прямоугольник
    pole: `
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="4" width="6" height="16" fill="#333333" stroke="#000000" stroke-width="2"/>
            <rect x="7" y="2" width="10" height="2" fill="#666666" stroke="#000000" stroke-width="1"/>
        </svg>
    `,
    
    // Столб выделенный
    pole_selected: `
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="4" width="6" height="16" fill="#FF6B6B" stroke="#FF4444" stroke-width="2"/>
            <rect x="7" y="2" width="10" height="2" fill="#FF8888" stroke="#FF4444" stroke-width="1"/>
        </svg>
    `,
    
    // POE коробка с камерой - poe коробка + камера
    pole_with_camera: `
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="4" width="6" height="16" fill="#4A90E2" stroke="#2C6FB7" stroke-width="2"/>
            <rect x="7" y="2" width="10" height="2" fill="#6BA8E8" stroke="#2C6FB7" stroke-width="1"/>
            <circle cx="12" cy="8" r="3" fill="#FFFFFF" stroke="#2C6FB7" stroke-width="1"/>
            <circle cx="12" cy="8" r="1" fill="#2C6FB7"/>
        </svg>
    `,
    
    // POE коробка с камерой выделенный
    pole_with_camera_selected: `
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="4" width="6" height="16" fill="#FF6B6B" stroke="#FF4444" stroke-width="2"/>
            <rect x="7" y="2" width="10" height="2" fill="#FF8888" stroke="#FF4444" stroke-width="1"/>
            <circle cx="12" cy="8" r="3" fill="#FFFFFF" stroke="#FF4444" stroke-width="1"/>
            <circle cx="12" cy="8" r="1" fill="#FF4444"/>
        </svg>
    `,

    // Функция для получения иконки в формате data URL
    getIcon: function(iconName) {
        const svgString = this[iconName];
        if (!svgString) return '';
        
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        return URL.createObjectURL(blob);
    },

    // Функция для предзагрузки всех иконок
    preloadIcons: function() {
        Object.keys(this).forEach(key => {
            if (typeof this[key] === 'string' && key !== 'getIcon' && key !== 'preloadIcons') {
                this.getIcon(key); // Создаем URL для кэширования
            }
        });
    }
};

// Предзагружаем иконки при загрузке
document.addEventListener('DOMContentLoaded', function() {
    svgIcons.preloadIcons();
});