import React, { useRef, useState } from 'react';
import { Dropdown, Input, Button, Menu, Space, Divider, theme } from 'antd';
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { Can } from '../../contexts/AbilityContext';
import { Link, useNavigate } from 'react-router-dom';

const { useToken } = theme;

const CustomDropdown = ({ extraModules, org, setActiveModule, darkMode, ability, activeModule }) => {
    const [searchValue, setSearchValue] = useState('');
    const ref = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate()

    const handleModuleChange = (moduleName) => {
        setIsOpen(false);
        navigate(`/${org}/${moduleName}`)
    };

    const openSelect = () => {
        setIsOpen(!isOpen);
        setTimeout(() => {
            if (ref.current) {
                ref.current.focus({
                    cursor: 'all',
                });
            }
        }, 100);
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleModuleSelect = (module) => {
        setActiveModule(module.name);
        setIsOpen(false); // Fecha o dropdown após a seleção
        // Navega para o link do módulo
        navigate(`/${org}/${module.api_name || module.name}`)
    };

    const filteredModules = extraModules.filter((module) =>
        module.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const menu = (
        <Menu>
            <Menu.Item>
                <Input
                    ref={ref}
                    placeholder="Pesquisar módulos"
                    value={searchValue}
                    onChange={handleSearchChange}
                    // onBlur={() => setIsOpen(false)} // Fecha ao perder o foco
                    autoFocus
                />
            </Menu.Item>
            {filteredModules.length > 0 ? (
                filteredModules.map((module) => (

                    // <Can I='read' a={(module.api_name ? module.api_name : module.name)} ability={ability}>
                    <Menu.Item
                        key={module.name}
                        onClick={() => handleModuleSelect(module)}
                        style={{
                            padding: '8px 16px',
                            cursor: 'pointer',
                        }}
                        className={`modules ${activeModule === (module.api_name ? module.api_name : module.name) ? 'active' : ''}`}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: darkMode ? '#fff' : '#000', display: 'block', width: '100%' }}>
                                {module.name.charAt(0).toUpperCase() + module.name.slice(1)}
                            </span>
                            <Button
                                // type="text"
                                icon={<PlusOutlined />}
                                size="small"
                                onClick={(e) => {
                                    navigate(`/${org}/${module.name}/create`)
                                    e.stopPropagation()
                                }}
                            />
                        </div>
                    </Menu.Item>
                    // </Can> 
                ))
            ) : (
                <Menu.Item disabled>Nenhum módulo encontrado</Menu.Item>
            )}
        </Menu>
    );

    const { token } = useToken();
    const contentStyle = {
        backgroundColor: token.colorBgElevated,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary
    };

    const menuStyle = {
        boxShadow: 'none',
    };

    return (
        <div>
            <Dropdown
                overlay={menu}
                trigger={['click']}
                onVisibleChange={(visible) => setIsOpen(visible)}
                visible={isOpen}
                dropdownRender={(menu) => (
                    <div style={contentStyle}>
                        {React.cloneElement(menu, {
                            style: menuStyle,
                        })}
                        <Divider
                            style={{
                                margin: 0,
                            }}
                        />
                        <Space
                            style={{
                                padding: 4,
                                display: 'flex',
                                justifyContent: 'center'
                            }}
                        >
                            <Link to={`/${org}/settings/modules`}>
                                <Button type='link'>Criar Novo Módulo</Button>
                            </Link>
                        </Space>
                    </div>
                )}
            >
                <Button type='text' shape='circle' onClick={openSelect} icon={<EllipsisOutlined />} />
            </Dropdown>
        </div>
    );
};

export default CustomDropdown;
