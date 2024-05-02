import { useState } from 'react';
import meats from '../img/categories/meats.png';
import extras from '../img/categories/extras.png';
import hotDrinks from '../img/categories/hot_drink.png';
import mexicana from '../img/categories/mexicana.png';
import naturalDrinks from '../img/categories/natural_drink.png';
import packagedDrink from '../img/categories/packaged_drink.png';
import beers from '../img/categories/beers.png';
import '../styles/categoriesStyle.css';
import menuLogo from '../img/logos/logo.png';

function IconCategoriesProvider(params) {

    const { display, iconSelect, onClick } = params;
    
    const icons = [
        { id: 0, icon: menuLogo, alt: "default" },
        { id: 1, icon: meats, alt: "Meats" },
        { id: 2, icon: extras, alt: "Extras" },
        { id: 3, icon: hotDrinks, alt: "Hot Drinks" },
        { id: 4, icon: mexicana, alt: "Mexicana" },
        { id: 5, icon: naturalDrinks, alt: "Natural Drinks" },
        { id: 6, icon: packagedDrink, alt: "Packaged Drink" },
        { id: 7, icon: beers, alt: "Cervezas" }
    ]

    function getIconImg()
    {
        if(iconSelect === null)
        {
            return icons[0];
        }

        return icons.find(icon => icon.id === iconSelect);
    }

    return (
        <>
            {display ?
                <img
                    width={55}
                    height={55}
                    src={getIconImg().icon}
                    style={{ objectFit: 'cover' }}
                    alt={getIconImg().alt}
                />
                :
                <div className="icon-grid">
                    {icons.map((icon) => (
                        <img
                            key={icon.id}
                            src={icon.icon}
                            alt={icon.alt}
                            className={iconSelect === icon.id ? 'selected' : 'no-selected'}
                            onClick={() => onClick(icon.id)}
                        />
                    ))}
                </div>
            }
        </>
    );
}

export default IconCategoriesProvider;
