import { useState, useEffect, useRef } from 'react';
import { Button, Col, Tooltip } from 'antd';
import { Can } from '../../contexts/AbilityContext';
import CustomDropdown from './CustomDropdown';
import { HomeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const HeaderModules = ({ modules, org, darkMode, activeModule, setActiveModule, ability, ref2 }) => {
    // const refModules = useRef(null);
    const [visibleModules, setVisibleModules] = useState([]);
    const [extraModules, setExtraModules] = useState([]);
    const navigate = useNavigate();

    const handleClick = (moduleData) => {
        setActiveModule(moduleData.name);
        navigate(`/${org}/${moduleData.api_name ? moduleData.api_name : moduleData.name}`);
    };

    useEffect(() => {
        const checkOverflow = () => {
            const containerWidth = ref2.current.offsetWidth;
            let currentWidth = 0;
            const visible = [];
            const extra = [];

            // Primeiro, verifica e inclui o módulo ativo na lista de visíveis, se ele for encontrado
            const activeModuleObj = modules.find(module => module.name === activeModule || module.api_name === activeModule);
            const activeModuleWidth = activeModuleObj ? activeModuleObj.name.length * 8 + 50 : 0;

            // Verifica o tamanho disponível e adiciona os módulos na sequência
            modules.forEach((module) => {
                const moduleWidth = module.name.length * 8 + 50;

                if (module === activeModuleObj) {
                    // Se o módulo ativo precisa substituir módulos visíveis
                    while (currentWidth + activeModuleWidth > containerWidth && visible.length > 0) {
                        const removedModule = visible.pop(); // Remove o último módulo visível
                        currentWidth -= removedModule.name.length * 8 + 50;
                        extra.unshift(removedModule); // Adiciona o módulo removido ao início dos extras
                    }

                    if (currentWidth + activeModuleWidth <= containerWidth) {
                        visible.push(activeModuleObj); // Adiciona o módulo ativo no final dos visíveis
                        currentWidth += activeModuleWidth;
                    } else {
                        extra.push(activeModuleObj); // Se ainda não couber, vai para o dropdown
                    }
                } else if (currentWidth + moduleWidth < containerWidth) {
                    visible.push(module);
                    currentWidth += moduleWidth;
                } else {
                    extra.push(module);
                }
            });

            setVisibleModules(visible);
            setExtraModules(extra);
        };


        checkOverflow();
        window.addEventListener('resize', checkOverflow);

        return () => window.removeEventListener('resize', checkOverflow);
    }, [modules, activeModule]);

    return (
        <Col xs={10} sm={16} md={16} lg={18} xl={20} ref={ref2} style={{ marginLeft: "5px", display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
            {/* <Tooltip title="Página Inicial">
                <Button
                    type="text"
                    shape="circle"
                    style={{ color: darkMode ? '#fff' : '#000', whiteSpace: 'nowrap', padding: 13 }}
                    href={`/${org}/home`}
                    onClick={() => setActiveModule('home')}
                    icon={<HomeOutlined />}
                >
                </Button>
            </Tooltip> */}
            {/* <Link
                className={`modules ${activeModule === 'chats' ? 'active' : ''}`}
                style={{ color: darkMode ? '#fff' : '#000', whiteSpace: 'nowrap', padding: 13 }}
                href={`/${org}/chats`}
                onClick={() => setActiveModule('chats')}
            >
                Chats
            </Link> */}

            {visibleModules.map((module, index) => (
                <Can I='read' a={(module.api_name ? module.api_name : module.name)} ability={ability} key={index}>
                    {/* <Link
                        className={`modules ${activeModule === (module.api_name ? module.api_name : module.name) ? 'active' : ''}`}
                        style={{ color: darkMode ? '#fff' : '#000', whiteSpace: 'nowrap', padding: 13 }}
                        // href={`/${org}/${(module.api_name ? module.api_name : module.name)}`}
                        onClick={() => handleClick(module)}
                    >
                        {module.name.charAt(0).toUpperCase() + module.name.slice(1)}
                    </Link> */}
                    <Link
                        to={`/${org}/${module.api_name ? module.api_name : module.name}`}
                        className={`modules ${activeModule === (module.api_name ? module.api_name : module.name) ? 'active' : ''}`}
                        style={{ color: darkMode ? '#fff' : '#000', whiteSpace: 'nowrap', padding: 13 }}
                        onClick={() => setActiveModule(module.name)}
                    >
                        {module.name.charAt(0).toUpperCase() + module.name.slice(1)}
                    </Link>
                </Can>
            ))}

            <CustomDropdown extraModules={extraModules} org={org} setActiveModule={setActiveModule} darkMode={darkMode} ability={ability} activeModule={activeModule} />
        </Col>
    );
};

export default HeaderModules