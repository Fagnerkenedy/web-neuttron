import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import styled, { createGlobalStyle } from 'styled-components';
import { notification, Button, Card, Layout, theme, Modal, Form, Input, Row, Col, Typography, Collapse, Checkbox, message, Select, Space, Tour, Tooltip, ConfigProvider, InputNumber } from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { CalendarOutlined, CloseOutlined, EditOutlined, EllipsisOutlined, MinusCircleOutlined, PlusCircleOutlined, PlusOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import './styles.css'
import InputOutlined from '../../../../../../src/img/text.png'
import NumbersOutlined from '../../../../../../src/img/123.png'
import CheckboxOutlined from '../../../../../../src/img/checkbox.png'
import MultilineOutlined from '../../../../../../src/img/multiline.png'
import CurrencyOutlined from '../../../../../../src/img/dollar.png'
import SectionOutlined from '../../../../../../src/img/section.png'
import DropdownOutlined from '../../../../../../src/img/dropdown.png'
import PhoneOutlined from '../../../../../../src/img/telephone.png'
import EmailOutlined from '../../../../../../src/img/envelope.png'
import DateTimeOutlined from '../../../../../../src/img/datetime.png'
import { useOutletContext } from 'react-router-dom';
import { getModulesTour, updateModulesTour } from './modulesTour';
import { fetchModules } from '../../../selection/fetchModules';

const { Title, Text } = Typography;
const { Content } = Layout;
const { Panel } = Collapse;
const { Option } = Select;

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const copy = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const item = sourceClone[droppableSource.index];

  destClone.splice(droppableDestination.index, 0, { ...item, id: uuid(), sort_order: droppableDestination.index });
  return destClone;
};

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  removed.sort_order = droppableDestination.index;
  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const ContentContainer = styled(Content)`
  margin-left: 255px;
  padding: 6px;
`;

const DragContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Column = styled.div`
  flex: 1;
  padding: 4px 4px 0 4px;
  min-width: 0;
  border-radius: 6px;
  margin: 8px;
  .dragging {
    opacity: 0.5;
  }
`;
// border: 2px dashed #ddd;
// background-color: ${props => props.isDraggingOver ? '#f0f0f0' : '#fff'};

const Notice = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #888;
`;

const GlobalStyle = createGlobalStyle`
  .dragging {
    user-select: none;
    opacity: 0.5;
  }
`;

// const Item = styled.div`
//     display: flex;
//     user-select: none;
//     padding: 0.5rem;
//     margin: 0 0 0.5rem 0;
//     align-items: flex-start;
//     align-content: flex-start;
//     line-height: 1.5;
//     border-radius: 3px;
//     background: #fff;
//     border: 1px ${props => (props.isDragging ? 'dashed #4099ff' : 'solid #ddd')};
// `;

// const Clone = styled(Item)`
//     + div {
//         display: none !important;
//     }
// `;

const initialItems = [
  { id: '4382179501276348291', name: 'Linha única', type: "VARCHAR(255)", field_type: "single_line", required: false },
  { id: '9821645032784591637', name: 'Multilinha', type: "TEXT(16000)", field_type: 'multi_line', required: false },
  { id: '1748395062183729450', name: 'Número', type: "VARCHAR(255)", field_type: 'number', required: false },
  { id: '3650918476023874915', name: 'Caixa de seleção', type: "VARCHAR(255)", field_type: 'checkbox', required: false },
  { id: '8492017364859271043', name: 'Moeda', type: "VARCHAR(255)", field_type: 'currency', required: false },
  { id: '6203841957028641975', name: 'Pesquisar', type: "VARCHAR(255)", field_type: 'loockup', required: false },
  { id: '1054729836042817596', name: 'Lista de opções', type: "VARCHAR(255)", field_type: 'select', options: [''], required: false },
  { id: '7510938265401728493', name: 'Data', type: "VARCHAR(255)", field_type: 'date', required: false },
  { id: '3904851627489206173', name: 'Data/Hora', type: "VARCHAR(255)", field_type: 'date_time', required: false },
  { id: '8642915073281649052', name: 'E-mail', type: "VARCHAR(255)", field_type: 'email', required: false },
  { id: '4297810653842096175', name: 'Telefone', type: "VARCHAR(255)", field_type: 'phone', required: false },
  // { id: 'add-list', name: 'Nova Seção', field_type: 'section' }
];
const sectionItems = [
  { id: 'add-list', name: 'Nova Seção', field_type: 'section' }
]

const DragAndDrop = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [lists, setLists] = useState({ left: [], right: [] });
  const [ITEMS, setItems] = useState(initialItems);
  const [sections, setSections] = useState({});
  const [sectionOrder, setSectionOrder] = useState([]);
  const linkApi = process.env.REACT_APP_LINK_API;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isChanged, setIsChanged] = useState(false);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [unusedItems, setUnusedItems] = useState([]);
  const [deletedSections, setDeletedSections] = useState([]);
  const [smallHeight, setSmallHeight] = useState(false);
  const [relatedModuleData, setRelatedModuleData] = useState([]);
  const [relatedFields, setRelatedFields] = useState([]);
  const [activeModule, setActiveModule] = useState("");
  let navigate = useNavigate()
  const inputRef = useRef(null);

  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const org = pathParts[1];
  const moduleName = pathParts[4];
  const record_id = pathParts[5];
  const [clickedItem, setClickedItem] = useState([])
  const { darkMode } = useOutletContext();
  const [modulesTour, setModulesTour] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusSM },
  } = theme.useToken();

  const updateTour = async () => {
    const updateTour = await updateModulesTour(org, user.id)
    console.log("updateTour: ", updateTour)

    setModulesTour(updateTour.modulesTour)
  }

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const steps = [
    {
      title: 'Seções e Campos',
      description: 'Crie novos campos e seções arrastando os itens da lateral.',
      target: () => ref1.current,
      placement: 'right',
      nextButtonProps: {
        children: 'Próximo',
      },
    },
    {
      title: 'Layout',
      description: 'Reorganize os campos e seções e configure as propriedades clicando nos itens.',
      target: () => ref2.current,
      prevButtonProps: {
        children: 'Voltar',
      },
      nextButtonProps: {
        children: 'Avançar',
      },
    },
    {
      title: 'Salvar',
      description: 'Quando estiver tudo pronto, clique em Salvar para aplicar o novo layout e as mudanças serão refletidas ao criar ou editar um novo registro.',
      target: () => ref3.current,
      prevButtonProps: {
        children: 'Voltar',
      },
      nextButtonProps: {
        children: 'Concluir',
      },
    },
  ];

  const fetchData = async () => {
    try {
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split('/');
      const org = pathParts[1];
      const moduleName = pathParts[4];
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios.get(`${linkApi}/sections/${org}/${moduleName}`, config);
      const sectionsData = response.data.sections;
      const newSections = {};
      const newSectionOrder = [];
      let newUnusedItems = []

      const responseUnusedFields = await axios.get(`${linkApi}/crm/${org}/${moduleName}/unused_fields`, config);

      const unusedFields = responseUnusedFields.data
      console.log("responseUnusedFields: ", responseUnusedFields)
      sectionsData.forEach(section => {
        const sectionId = section.id;
        const sectionName = section.name;

        const leftFields = section.fields.left || [];
        const rightFields = section.fields.right || [];

        //   // Filtrar os campos não utilizados
        //   const unusedLeftFields = leftFields.filter(field => field.unused);
        //   const unusedRightFields = rightFields.filter(field => field.unused);

        //   // Adicionar os campos não utilizados ao array `newUnusedItems`
        //   newUnusedItems = [...newUnusedItems, ...unusedLeftFields, ...unusedRightFields];

        //   // Remover os campos não utilizados das seções
        //   const usedLeftFields = leftFields.filter(field => !field.unused);
        //   const usedRightFields = rightFields.filter(field => !field.unused);

        newSections[sectionId] = {
          left: leftFields,
          right: rightFields
        };
        newSectionOrder.push({ sectionId, sectionName, field_type: "section" });

      });

      setUnusedItems(unusedFields)
      setSections(newSections);
      setSectionOrder(newSectionOrder);
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    }
  };

  async function fetchModulesData() {
    const fetchedModules = await fetchModules(org);
    fetchedModules.result.forEach(module => {
      if (module.api_name == moduleName || module.name == moduleName) {
        setActiveModule(module.name)
      }
    });
  }

  useEffect(async () => {
    const getTour = await getModulesTour(org, user.id)
    let modulesTour = ''
    if (getTour.data.length > 0) modulesTour = getTour.data[0].modules_tour
    setModulesTour(modulesTour)
    fetchData();
    fetchModulesData();
  }, []);

  // Cria um alerta que evita que o usuário saia da página sem salvar o que foi alterado.
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isChanged) {
        event.preventDefault();
        event.returnValue = ''; // A mensagem exata não é mais suportada por todos os navegadores
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isChanged]);

  const onDragStart = (event, provided) => {
    disableTextSelection()
    const { type } = event
    if (type == "section") {
      setSmallHeight(true)
    }

    // document.body.classList.add('dragging');

    // Verifica se o target do evento é válido
    // const target = event.target;
    // if (!target) {
    //   console.error('Target do evento de arrastar não encontrado.');
    //   return;
    // }

    // // Cria um clone do elemento que está sendo arrastado
    // const clone = target.cloneNode(true);
    // clone.style.position = 'absolute';
    // clone.style.top = `${event.clientY}px`;
    // clone.style.left = `${event.clientX}px`;
    // clone.style.pointerEvents = 'none'; // O clone não deve interferir nos eventos do mouse

    // // Adiciona a classe 'dragging' ao clone
    // clone.classList.add('dragging');

    // // Adiciona o clone ao body do documento
    // document.body.appendChild(clone);

    // // Armazena o clone para removê-lo depois
    // event.dataTransfer.setDragImage(clone, 0, 0);
  };

  const onDragEnd = result => {
    const { source, destination, type } = result;
    setIsChanged(true);
    setSmallHeight(false)
    enableTextSelection();
    document.body.classList.remove('dragging');

    if (!destination) {
      return;
    }

    if (source.droppableId == 'section-draggable' && destination.droppableId != 'section-draggable') {
      const draggedItem = sectionItems[source.index];
      if (draggedItem.id === 'add-list') {
        const newSectionId = uuid();
        setSections(prevSections => ({ ...prevSections, [newSectionId.split('-')[0]]: { left: [], right: [] } }));

        const result = Array.from(sectionOrder);
        result.splice(destination.index, 0, { sectionId: newSectionId.split('-')[0], sectionName: "Nova Seção", field_type: "section" });

        setSectionOrder(result)
        return;
      }
      // showModal(draggedItem);
    }
    if (source.droppableId == 'section-draggable' && destination.droppableId == 'section-draggable') {
      return;
    }

    if (type === 'section') {
      const newSectionOrder = reorder(
        sectionOrder,
        source.index,
        destination.index
      );
      setSectionOrder(newSectionOrder);
      return;
    }

    let updatedUnusedFields = Array.from(unusedItems);
    let updatedUsedFields = Array.from(ITEMS);

    // Se arrastando da área de campos não utilizados para a área de drop
    if (source.droppableId === "unusedFields" && destination.droppableId !== "unusedFields") {
      const [movedItem] = updatedUnusedFields.splice(source.index, 1);

      // Atualiza o campo unused para false
      const updatedMovedItem = { ...movedItem, unused: false, sort_order: destination.index }
      updatedUsedFields.splice(destination.index, 0, updatedMovedItem);

      // Atualiza os campos não utilizados e os campos utilizados
      setUnusedItems(updatedUnusedFields);
      setSections(prevSections => {
        const destinationDroppableParts = destination.droppableId.split('-');
        const sectionId = destinationDroppableParts[2];
        const columnId = destinationDroppableParts[0];

        // Cria uma cópia da coluna e insere o item no índice correto
        const updatedColumn = Array.from(prevSections[sectionId][columnId]);
        updatedColumn.splice(destination.index, 0, updatedMovedItem);

        const updatedSection = {
          ...prevSections[sectionId],
          [columnId]: updatedColumn
        };
        return {
          ...prevSections,
          [sectionId]: updatedSection
        };
      });
      return;
    }

    const destinationDroppableParts = destination.droppableId.split('-');
    if (destinationDroppableParts.length < 3) {
      console.error('Invalid destination droppableId:', destination.droppableId);
      return;
    }
    const sectionId = destinationDroppableParts[2];
    const columnId = destinationDroppableParts[0];

    if (!sections[sectionId]) {
      setSections(prevSections => ({
        ...prevSections,
        [sectionId]: {
          left: [],
          right: []
        }
      }));
    }

    switch (source.droppableId) {
      case destination.droppableId:
        setSections(prevSections => ({
          ...prevSections,
          [sectionId]: {
            ...prevSections[sectionId],
            [columnId]: reorder(
              prevSections[sectionId][columnId],
              source.index,
              destination.index
            )
          }
        }));
        break;
      case 'ITEMS':
        setSections(prevSections => ({
          ...prevSections,
          [sectionId]: {
            ...prevSections[sectionId],
            [columnId]: copy(
              ITEMS,
              prevSections[sectionId][columnId],
              source,
              destination
            )
          }
        }));
        break;
      default:
        const sourceSectionId = source.droppableId.split('-')[2];
        const sourceColumnId = source.droppableId.split('-')[0];
        const destinationSectionId = destination.droppableId.split('-')[2];
        const destinationColumnId = destination.droppableId.split('-')[0];

        // Verificar se as seções e colunas são válidas antes de continuar
        if (!sections[sourceSectionId] || !sections[destinationSectionId]) {
          console.error('Invalid section IDs:', sourceSectionId, destinationSectionId);
          return;
        }
        if (!sections[sourceSectionId][sourceColumnId] || !sections[destinationSectionId][destinationColumnId]) {
          console.error('Invalid column IDs:', sourceColumnId, destinationColumnId);
          return;
        }

        const moveResult = move(
          sections[sourceSectionId][sourceColumnId],
          sections[destinationSectionId][destinationColumnId],
          source,
          destination
        );

        if (sourceSectionId == destinationSectionId) {
          setSections(prevSections => ({
            ...prevSections,
            [sourceSectionId]: {
              ...prevSections[sourceSectionId],
              [sourceColumnId]: moveResult[source.droppableId],
              [destinationColumnId]: moveResult[destination.droppableId]
            }
          }));
        } else {
          setSections(prevSections => ({
            ...prevSections,
            [sourceSectionId]: {
              ...prevSections[sourceSectionId],
              [sourceColumnId]: moveResult[source.droppableId],
            },
            [destinationSectionId]: {
              ...prevSections[destinationSectionId],
              [destinationColumnId]: moveResult[destination.droppableId]
            }
          }));
        }
        break;
    }
  };

  // const addItem = () => {
  //   const newItem = { id: uuid(), name: 'New Item' };
  //   setItems(prevItems => [...prevItems, newItem]);
  // };

  // const addSection = () => {
  //   const newSectionId = uuid();
  //   const newSectionName = `Section ${sectionOrder.length + 1}`;
  //   setSections(prevSections => ({
  //     ...prevSections,
  //     [newSectionId]: { left: [], right: [] }
  //   }));
  //   setSectionOrder(prevOrder => [...prevOrder, { sectionId: newSectionId, sectionName: newSectionName }]);
  // };

  const saveChanges = async () => {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1];
    const moduleName = pathParts[4];
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const sectionsData = sectionOrder.map(({ sectionId, sectionName }) => ({
      id: sectionId,
      name: sectionName,
      fields: sections[sectionId]
    }));

    const payload = {
      sections: sectionsData
    };

    console.log("payload: ", payload)
    console.log("payload deletedSections: ", deletedSections)
    console.log("payload config: ", config)
    try {
      const response = await axios.post(`${linkApi}/sections/${org}/${moduleName}`, payload, config);
      const responseSections = await axios.delete(`${linkApi}/sections/${org}/${moduleName}`, {
        data: deletedSections,
        ...config
      });
      if (unusedItems.length !== 0) {
        console.log("unusedItems: ", unusedItems)
        const responseUnusedItems = await axios.put(`${linkApi}/crm/${org}/${moduleName}/unused_field`, unusedItems, config);
      }
      message.success('Layout atualizado!');
      console.log('Changes saved successfully:', response.data);
      console.log('Changes saved successfully sections:', responseSections.data);

      setIsChanged(false);
    } catch (error) {
      console.error('Error saving changes:', error);
    }
    fetchData();
  };

  const extractNumbers = (inputString) => {
    const numbers = inputString.match(/\d+/g);
    return numbers ? numbers.join('') : '';
  }

  const fetchOptions = async (moduleName, api_name) => {
    console.log("fetchh", moduleName, api_name)

    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/field/${api_name}`, config);
    return response.data
  }

  const showModal = async (item) => {
    console.log("item clickedItem", clickedItem)
    console.log("item item", item)
    if (item.hasOwnProperty("sectionId")) {
      console.log("entrou section")
      form.setFieldsValue({
        field_type: "section",
        label: item.sectionName,
      })
    } else if (item.field_type == "loockup") {
      console.log("entrou loockup")
      form.setFieldsValue({
        field_type: item.field_type,
        api_name: item.api_name,
        label: item.name,
        module: item.related_module,
        required: item.required,
        disabled: item.disabled,
        search_field: item.search_field
      })
    } else if (item.field_type == "select") {
      console.log("entrou select")
      console.log("iitem select: ", item)
      let options = ['']
      if (item.api_name) {
        options = []
        const result = await fetchOptions(item.module, item.api_name)
        console.log("result options: ", result)
        result.forEach(option => {
          options.push(option.name)
        });
      }
      console.log("options: ", options)
      form.setFieldsValue({
        field_type: item.field_type,
        api_name: item.api_name,
        label: item.name,
        options: options,
        required: item.required,
        disabled: item.disabled
      })
    } else if (item.field_type == "number") {
      console.log("entrou loockup")
      form.setFieldsValue({
        field_type: item.field_type,
        api_name: item.api_name,
        label: item.name,
        char: 19,
        required: item.required,
        disabled: item.disabled
      })
    } else if (item.field_type == "currency") {
      console.log("entrou loockup")
      form.setFieldsValue({
        field_type: item.field_type,
        api_name: item.api_name,
        label: item.name,
        char: 19,
        required: item.required,
        disabled: item.disabled
      })
    } else {
      console.log("entrou outros")
      console.log("caiu aqyui field_type", item.field_type)
      console.log("caiu aqyui api_name", item.api_name)
      console.log("caiu aqyui name", item.name)
      console.log("caiu aqyui type", extractNumbers(item.type))
      console.log("caiu aqyui required", item)
      form.setFieldsValue({
        field_type: item.field_type,
        api_name: item.api_name,
        label: item.name,
        char: await extractNumbers(item.type),
        required: item.required,
        disabled: item.disabled
      })
    }

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus({
          cursor: 'all',
        });
      }
    }, 100);
    setIsModalVisible(true);
    // setClickedItem([item])
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      console.log("values select: ", values)
      console.log("sections select: ", sections)
      console.log("sections clickedItem: ", clickedItem)
      if (clickedItem.item.field_type == 'section') {
        sectionOrder[clickedItem.index].sectionName = values.label
      } else if (clickedItem.item.field_type == 'loockup') {
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].name = values.label
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].type = 'VARCHAR(255)'
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].related_module = values.module
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].search_field = values.search_field
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].required = values.required
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].disabled = values.disabled
      } else if (clickedItem.item.field_type == 'select') {
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].name = values.label
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].type = 'VARCHAR(255)'
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].options = values.options
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].required = values.required
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].disabled = values.disabled
      } else if (clickedItem.item.field_type == 'multi_line') {
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].name = values.label
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].type = `TEXT(${values.char})`
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].required = values.required
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].disabled = values.disabled
      } else if (clickedItem.item.field_type == 'date') {
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].name = values.label
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].type = `VARCHAR(255)`
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].required = values.required
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].disabled = values.disabled
      } else if (clickedItem.item.field_type == 'date_time') {
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].name = values.label
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].type = `VARCHAR(255)`
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].required = values.required
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].disabled = values.disabled
      } else if (clickedItem.item.field_type == 'checkbox') {
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].name = values.label
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].disabled = values.disabled
      } else {
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].name = values.label
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].type = `VARCHAR(${values.char})`
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].related_module = values.module
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].required = values.required
        sections[clickedItem.item.section_id ? clickedItem.item.section_id : clickedItem.section_id][clickedItem.item.position ? clickedItem.item.position : clickedItem.position][clickedItem.index].disabled = values.disabled
      }
      setIsModalVisible(false);
      form.resetFields();
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleMenuClick = (item, position, sectionId, index) => {
    console.log("teste", item)
    setClickedItem({ item, position, section_id: sectionId, index })
    console.log("teste clickedItem", clickedItem)
    showModal(item);
  };

  const handleSectionClick = (item, sectionId, index) => {
    setClickedItem({ item, position: null, section_id: sectionId, index })
    showModal(item);
  }

  const disableTextSelection = () => {
    document.body.style.userSelect = "none";
  };

  const enableTextSelection = () => {
    document.body.style.userSelect = "auto";
  };

  const showNotification = (message, description, placement, type) => {
    if (!type) type = 'info';
    notification[type]({ // success, info, warning, error
      message: message,
      description: description,
      placement: placement, // topLeft, topRight, bottomLeft, bottomRight, top, bottom
    });
  };

  const handleRemoveField = (itemId) => {
    // Remove o item de onde ele está atualmente (aqui depende da sua estrutura de estado)
    const updatedSections = { ...sections };
    let itemToRemove = null;

    // Procure o item nas seções
    for (const sectionId in updatedSections) {
      const leftIndex = updatedSections[sectionId].left.findIndex(item => item.id === itemId);
      if (leftIndex !== -1) {
        itemToRemove = updatedSections[sectionId].left.splice(leftIndex, 1)[0];
        break;
      }
      const rightIndex = updatedSections[sectionId].right.findIndex(item => item.id === itemId);
      if (rightIndex !== -1) {
        itemToRemove = updatedSections[sectionId].right.splice(rightIndex, 1)[0];
        break;
      }
    }

    // Adicione o item à lista de itens não utilizados
    if (itemToRemove) {
      const updatedItemToRemove = { ...itemToRemove, unused: true };
      setUnusedItems(prevUnusedItems => [...prevUnusedItems, updatedItemToRemove])
      showNotification('Item removido', `O campo ${itemToRemove.name} foi movido para 'Campos não utilizados'`, 'bottom')
    }
    console.log("sections sectionssectionssections 2: ", sections)

    // Atualize o estado das seções
    setSections(updatedSections);
  };

  const handleRemoveSection = (section_id) => {
    const allSections = { ...sections };
    console.log("allSections: ", allSections[section_id].left.length)
    let allFields = []
    allSections[section_id].left.forEach(field => {
      allFields.push(field)
    })
    allSections[section_id].right.forEach(field => {
      allFields.push(field)
    });
    if (allFields.length != 0) {
      for (const field of allFields) {
        handleRemoveField(field.id)
      }
    }
    const updatedSections = [...sectionOrder];
    let itemToRemove = null;
    const index = updatedSections.findIndex(item => item.sectionId === section_id);
    if (index !== -1) {
      itemToRemove = updatedSections.splice(index, 1)[0];
    }
    console.log("itemToRemove: ", itemToRemove)
    if (itemToRemove) {
      const updatedItemToRemove = { ...itemToRemove };
      setDeletedSections([...deletedSections, itemToRemove])
      console.log("deletedSections: ", deletedSections)
    }
    setSectionOrder(updatedSections);
  };

  disableTextSelection()

  const onChange = (value) => {
    console.log("clickedItem: ", clickedItem)
    sections[clickedItem.sectionId][clickedItem.position][clickedItem.index].name = value
  }

  const fetchRelatedModule = async (open, relatedModuleName, api_name) => {
    if (open) {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios.get(`${linkApi}/crm/${org}/modules`, config);
      console.log("o que retornou? ", response)
      const matchingResponse = response.data.result.map(item => {
        return {
          field_value: item[api_name],
          related_id: item.api_name
        };
      });
      setRelatedModuleData(matchingResponse);
    }
  }

  const fetchRelatedFields = async (open, relatedModuleName, api_name) => {
    if (open) {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios.get(`${linkApi}/crm/${org}/${relatedModuleName}/fields`, config);
      console.log("o que retornou fields? ", response)
      const matchingResponse = response.data.map(item => {
        return {
          field_value: item.name,
          api_name: item.api_name
        };
      });
      setRelatedFields(matchingResponse);
    }
  }

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  };

  const formItemLayoutWithOutLabel = {
    wrapperCol: {
      xs: { span: 24, offset: 0 },
      sm: { span: 20, offset: 4 },
    },
  };

  return (
    <Layout>
      <Tour
        open={modulesTour}
        onClose={() => updateTour()}
        steps={steps}
      />
      <GlobalStyle />
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <Card
          size="small"
          style={{
            position: 'fixed',
            zIndex: 1000,
            top: 0,
            left: 0,
            width: 250,
            height: `calc(100vh - 130px)`,
            marginTop: 102,
            // paddingTop: 5,
            background: colorBgContainer,
            borderRadius: 0,
            overflowY: 'auto'
          }}
          bodyStyle={{ padding: 0 }}
          className='custom-scrollbar'
          ref={ref1}
        >
          <Collapse defaultActiveKey={['1']} ghost accordion size="small" style={{ width: 242 }}>
            <Panel
              header="Novos campos"
              key="1"
              style={{ width: 242 }}
              extra={
                <Tooltip title="Visualizar tour">
                  <Button
                    type="text"
                    shape="circle"
                    onClick={(e) => {
                      e.stopPropagation()
                      setModulesTour(true)
                    }}
                    icon={<QuestionCircleOutlined />}
                  />
                </Tooltip>
              }
            >
              <Droppable droppableId="section-draggable" type="section">
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {sectionItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            size="small"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            isDragging={snapshot.isDragging}
                            style={{
                              ...provided.draggableProps.style,
                              marginBottom: '8px'
                            }}
                            hoverable={true}
                            className='droppable-card'
                          >
                            <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                              <Col>
                                {item.field_type === "section" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={SectionOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : null}
                              </Col>
                            </Row>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                  </div>
                )}
              </Droppable>
              <Droppable droppableId="ITEMS" isDropDisabled={true}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {ITEMS.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            size="small"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            isDragging={snapshot.isDragging}
                            style={{
                              ...provided.draggableProps.style,
                              marginBottom: '8px'
                            }}
                            hoverable={true}
                            className='droppable-card'
                          >
                            <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                              <Col>
                                {item.field_type === "single_line" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={InputOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type == "select" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={DropdownOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type == "date" ? (
                                  <Col><CalendarOutlined /><Text style={{ marginLeft: '6px' }}>{item.name}</Text></Col>
                                ) : item.field_type == "loockup" ? (
                                  <Col><SearchOutlined /><Text style={{ marginLeft: '6px' }}>{item.name}</Text></Col>
                                ) : item.field_type == "currency" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={CurrencyOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type == "multi_line" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={MultilineOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type == "number" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={NumbersOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type == "checkbox" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={CheckboxOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type == "section" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={SectionOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type == "phone" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={PhoneOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type == "email" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={EmailOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type == "date_time" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={DateTimeOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : null}
                              </Col>
                            </Row>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Panel>

            <Panel header="Campos não utilizados" key="2" style={{ width: 242 }}>
              <Droppable droppableId="unusedFields" isDropDisabled={true}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {unusedItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            key={item.id}
                            size="small"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            isDragging={snapshot.isDragging}
                            style={{
                              ...provided.draggableProps.style,
                              marginBottom: '8px'
                            }}
                            hoverable={true}
                            className='droppable-card'
                          >
                            <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                              <Col>
                                {item.field_type === "single_line" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={InputOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type === "select" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={DropdownOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type === "date" ? (
                                  <Col><CalendarOutlined /><Text style={{ marginLeft: '6px' }}>{item.name}</Text></Col>
                                ) : item.field_type === "loockup" ? (
                                  <Col><SearchOutlined /><Text style={{ marginLeft: '6px' }}>{item.name}</Text></Col>
                                ) : item.field_type === "currency" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={CurrencyOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type === "multi_line" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={MultilineOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type === "number" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={NumbersOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type === "checkbox" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={CheckboxOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type === "section" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={SectionOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type === "phone" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={PhoneOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type === "email" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={EmailOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : item.field_type === "date_time" ? (
                                  <Col style={{ display: 'flex', alignItems: 'center' }}>
                                    <img style={{ width: '16px' }} src={DateTimeOutlined} alt="Logo" />
                                    <Text style={{ marginLeft: '6px' }}>{item.name}</Text>
                                  </Col>
                                ) : null}
                              </Col>
                            </Row>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Panel>
          </Collapse>
        </Card>

        <ContentContainer>
          <Row
            style={{
              marginTop: '51px',
              position: 'fixed',
              top: 0,
              right: 0,
              left: '0px',
              zIndex: 1000,
              // boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              background: colorBgContainer,
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '52px',
              borderBottom: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid'
            }}
          >
            <Col>
              <Text
                style={{ paddingLeft: '20px', fontSize: '22px' }}
              >
                {activeModule}
              </Text>
            </Col>
            <Col style={{ margin: '0 15px 0 0' }}>
              <Button href={`/${org}/settings/modules`}>Cancelar</Button>
              <Button ref={ref3} type="primary" onClick={saveChanges} style={{ marginLeft: 16 }}>
                Salvar
              </Button>
            </Col>
          </Row>
          <Droppable droppableId="section-droppable" type="section">
            {(provided, snapshot) => (
              <Col
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  position: 'fixed',
                  width: `calc(100% - 270px)`,
                  height: `calc(100vh - 145px)`,
                  marginTop: '50px',
                  overflowY: 'auto',
                  // backgroundColor: snapshot.isDraggingOver ? 'lightblue' : 'lightgrey',
                  padding: 8
                }}
                className='custom-scrollbar'
              >
                {sectionOrder.length > 0 ? sectionOrder.map((dados, index) => {
                  const sectionId = dados.sectionId
                  const sectionName = dados.sectionName
                  return (
                    <Draggable key={sectionId} draggableId={sectionId} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Card
                            key={sectionId}
                            style={{ marginBottom: 16, maxHeight: smallHeight ? '251px' : '', border: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid' }}
                            hoverable={true}
                            title={sectionName}
                            size="small"
                            extra={
                              <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveSection(sectionId)
                                }}
                              />
                            }
                            onClick={() => handleSectionClick(dados, sectionId, index)}
                            ref={ref2}
                          >
                            <DragContainer>
                              <Droppable droppableId={`left-SECTION-${sectionId}`}>
                                {(provided, snapshot) => (
                                  <Column ref={provided.innerRef} isDraggingOver={snapshot.isDraggingOver} style={{ maxHeight: smallHeight ? '170px' : '', overflow: smallHeight ? 'hidden' : '', border: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid' }}>
                                    {sections[sectionId]?.left.length
                                      ? sections[sectionId].left.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                width: '100%',
                                                ...provided.draggableProps.style,
                                                transition: snapshot.isDropAnimating ? "transform 0.07s ease" : provided.draggableProps.style.transition
                                              }}
                                            >
                                              <Card
                                                {...provided.dragHandleProps}
                                                isDragging={snapshot.isDragging}
                                                style={{ flex: 1, cursor: 'pointer', marginBottom: '8px' }}
                                                className='draggable-card'
                                                hoverable={true}
                                                size="small"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  handleMenuClick(item, 'left', sectionId, index)
                                                }}
                                              // hoverable
                                              >
                                                <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                                                  <Col span={8}>
                                                    <Form.Item
                                                        label={<span>{item.name}</span>}
                                                        name={item.name}
                                                        rules={[
                                                            {
                                                                required: item.required,
                                                                message: 'Este campo é obrigatório',
                                                            },
                                                        ]}
                                                        colon={false}
                                                        style={{ height: "10px" }}
                                                    ></Form.Item>
                                                  </Col>
                                                  <Col>
                                                    {item.field_type === "single_line" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={InputOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Linha Única</Text>
                                                      </Col>
                                                    ) : item.field_type === "select" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={DropdownOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Lista de opções</Text>
                                                      </Col>
                                                    ) : item.field_type === "date" ? (
                                                      <Col><CalendarOutlined /><Text style={{ marginLeft: '6px' }}>Data</Text></Col>
                                                    ) : item.field_type === "loockup" ? (
                                                      <Col><SearchOutlined /><Text style={{ marginLeft: '6px' }}>Pesquisar</Text></Col>
                                                    ) : item.field_type === "currency" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={CurrencyOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Moeda</Text>
                                                      </Col>
                                                    ) : item.field_type === "multi_line" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={MultilineOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Multilinha</Text>
                                                      </Col>
                                                    ) : item.field_type === "number" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={NumbersOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Número</Text>
                                                      </Col>
                                                    ) : item.field_type === "checkbox" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={CheckboxOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Caixa de seleção</Text>
                                                      </Col>
                                                    ) : item.field_type === "section" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={SectionOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Nova Seção</Text>
                                                      </Col>
                                                    ) : item.field_type === "phone" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={PhoneOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Telefone</Text>
                                                      </Col>
                                                    ) : item.field_type === "email" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={EmailOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>E-mail</Text>
                                                      </Col>
                                                    ) : item.field_type === "date_time" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={DateTimeOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Data/Hora</Text>
                                                      </Col>
                                                    ) : null}
                                                  </Col>
                                                  <Col span={8} style={{ textAlign: 'right' }}>
                                                    <Button
                                                      type="text"
                                                      icon={<CloseOutlined />}
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleRemoveField(item.id)
                                                      }} />
                                                  </Col>
                                                </Row>
                                              </Card>
                                            </div>
                                          )}
                                        </Draggable>
                                      ))
                                      : !provided.placeholder && <Notice>Drop items here</Notice>}
                                    {provided.placeholder}
                                  </Column>
                                )}
                              </Droppable>
                              <Droppable droppableId={`right-SECTION-${sectionId}`}>
                                {(provided, snapshot) => (
                                  <Column ref={provided.innerRef} isDraggingOver={snapshot.isDraggingOver} style={{ maxHeight: smallHeight ? '170px' : '', overflow: smallHeight ? 'hidden' : '', border: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid' }}>
                                    {sections[sectionId]?.right.length
                                      ? sections[sectionId].right.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                width: '100%',
                                                ...provided.draggableProps.style,
                                                transition: snapshot.isDropAnimating ? "transform 0.07s ease" : provided.draggableProps.style.transition
                                              }}
                                            >
                                              <Card
                                                {...provided.dragHandleProps}
                                                isDragging={snapshot.isDragging}
                                                style={{ flex: 1, cursor: 'pointer', marginBottom: '8px' }}
                                                className='draggable-card'
                                                hoverable={true}
                                                size="small"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  handleMenuClick(item, 'right', sectionId, index)
                                                }}
                                              // hoverable
                                              >
                                                <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                                                  <Col span={8}>
                                                    <Form.Item
                                                          label={<span>{item.name}</span>}
                                                          name={item.name}
                                                          rules={[
                                                              {
                                                                  required: item.required,
                                                                  message: 'Este campo é obrigatório',
                                                              },
                                                          ]}
                                                          colon={false}
                                                          style={{ height: "10px" }}
                                                    ></Form.Item>
                                                  </Col>
                                                  <Col>
                                                    {item.field_type === "single_line" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={InputOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Linha Única</Text>
                                                      </Col>
                                                    ) : item.field_type === "select" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={DropdownOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Lista de opções</Text>
                                                      </Col>
                                                    ) : item.field_type === "date" ? (
                                                      <Col><CalendarOutlined /><Text style={{ marginLeft: '6px' }}>Data</Text></Col>
                                                    ) : item.field_type === "loockup" ? (
                                                      <Col><SearchOutlined /><Text style={{ marginLeft: '6px' }}>Pesquisar</Text></Col>
                                                    ) : item.field_type === "currency" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={CurrencyOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Moeda</Text>
                                                      </Col>
                                                    ) : item.field_type === "multi_line" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={MultilineOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Multilinha</Text>
                                                      </Col>
                                                    ) : item.field_type === "number" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={NumbersOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Número</Text>
                                                      </Col>
                                                    ) : item.field_type === "checkbox" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={CheckboxOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Caixa de seleção</Text>
                                                      </Col>
                                                    ) : item.field_type === "section" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={SectionOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Nova Seção</Text>
                                                      </Col>
                                                    ) : item.field_type === "phone" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={PhoneOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Telefone</Text>
                                                      </Col>
                                                    ) : item.field_type === "email" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={EmailOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>E-mail</Text>
                                                      </Col>
                                                    ) : item.field_type === "date_time" ? (
                                                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img style={{ width: '16px' }} src={DateTimeOutlined} alt="Logo" />
                                                        <Text style={{ marginLeft: '6px' }}>Data/Hora</Text>
                                                      </Col>
                                                    ) : null}
                                                  </Col>
                                                  <Col span={8} style={{ textAlign: 'right' }}>
                                                    <Button
                                                      type="text"
                                                      icon={<CloseOutlined />}
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleRemoveField(item.id)
                                                      }} />
                                                  </Col>
                                                </Row>
                                              </Card>
                                            </div>
                                          )}
                                        </Draggable>
                                      ))
                                      : !provided.placeholder && <Notice>Drop items here</Notice>}
                                    {provided.placeholder}
                                  </Column>
                                )}
                              </Droppable>
                            </DragContainer>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  )
                }) : <Notice>No sections available</Notice>}
              </Col>
            )}
          </Droppable>
        </ContentContainer>
      </DragDropContext>
      <Modal
        title="Editar propriedades"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {form.getFieldValue('field_type') === 'section' && (
          <Form
            form={form}
            layout="vertical"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOk();
              }
            }}>
            <Form.Item
              name="label"
              label="Nome da seção"
              rules={[{ required: false, message: 'Insira um valor!' }]}
            >
              <Input ref={inputRef} />
            </Form.Item>
          </Form>
        )}
        {form.getFieldValue('field_type') === 'single_line' && (
          <Form
            form={form}
            layout="vertical"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOk();
              }
            }}>
            <Form.Item
              name="label"
              label="Nome do campo"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <Input ref={inputRef} />
            </Form.Item>
            <Form.Item
              name="char"
              label="Número de caracteres permitidos (Máximo 255)"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <InputNumber changeOnWheel max={255} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="required"
              valuePropName="checked"
            >
              <Checkbox>Obrigatório</Checkbox>
            </Form.Item>
            <Form.Item
              name="disabled"
              valuePropName="checked"
            >
              <Checkbox>Desabilitar</Checkbox>
            </Form.Item>
          </Form>
        )}
        {form.getFieldValue('field_type') === 'multi_line' && (
          <Form
            form={form}
            layout="vertical"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOk();
              }
            }}>
            <Form.Item
              name="label"
              label="Nome do campo"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <Input ref={inputRef} />
            </Form.Item>
            <Form.Item
              name="char"
              label="Número de caracteres permitidos (Máximo 16000)"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <InputNumber changeOnWheel max={16000} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="required"
              valuePropName="checked"
            >
              <Checkbox>Obrigatório</Checkbox>
            </Form.Item>
            <Form.Item
              name="disabled"
              valuePropName="checked"
            >
              <Checkbox>Desabilitar</Checkbox>
            </Form.Item>
          </Form>
        )}
        {form.getFieldValue('field_type') === 'number' && (
          <Form
            form={form}
            layout="vertical"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOk();
              }
            }}>
            <Form.Item
              name="label"
              label="Nome do campo"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <Input ref={inputRef} />
            </Form.Item>
            <Form.Item
              name="char"
              label="Número de caracteres permitidos (Máximo 19)"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <InputNumber changeOnWheel max={19} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="required"
              valuePropName="checked"
            >
              <Checkbox>Obrigatório</Checkbox>
            </Form.Item>
            <Form.Item
              name="disabled"
              valuePropName="checked"
            >
              <Checkbox>Desabilitar</Checkbox>
            </Form.Item>
          </Form>
        )}
        {form.getFieldValue('field_type') === 'checkbox' && (
          <Form
            form={form}
            layout="vertical"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOk();
              }
            }}>
            <Form.Item
              name="label"
              label="Nome do campo"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <Input ref={inputRef} />
            </Form.Item>
            <Form.Item
              name="disabled"
              valuePropName="checked"
            >
              <Checkbox>Desabilitar</Checkbox>
            </Form.Item>
          </Form>
        )}
        {form.getFieldValue('field_type') === 'currency' && (
          <Form
            form={form}
            layout="vertical"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOk();
              }
            }}>
            <Form.Item
              name="label"
              label="Nome do campo"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <Input ref={inputRef} />
            </Form.Item>
            <Form.Item
              name="char"
              label="Número de caracteres permitidos (Máximo 19)"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <InputNumber max={19} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="required"
              valuePropName="checked"
            >
              <Checkbox>Obrigatório</Checkbox>
            </Form.Item>
            <Form.Item
              name="disabled"
              valuePropName="checked"
            >
              <Checkbox>Desabilitar</Checkbox>
            </Form.Item>
          </Form>
        )}
        {form.getFieldValue('field_type') === 'loockup' && (
          <Form
            form={form}
            layout="vertical"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOk();
              }
            }}>
            <Form.Item
              name="label"
              label="Nome do campo"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <Input ref={inputRef} />
            </Form.Item>
            <Form.Item
              name="module"
              label="Módulo de pesquisa"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <Select
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                placeholder="Selecione"
                onDropdownVisibleChange={(open) => fetchRelatedModule(open, form.getFieldValue('module'), form.getFieldValue('api_name'))}
              >
                {relatedModuleData.map(item => (
                  <Option key={item.related_id} value={item.field_value}>
                    {item.field_value}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="search_field"
              label="Campo de pesquisa"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              {/* <ConfigProvider renderEmpty={() => "Selecione um Módulo para pesquisa"}> */}
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  placeholder="Selecione"
                  disabled={false}
                  onDropdownVisibleChange={(open) => {
                    if (form.getFieldValue('module') != null) {
                      fetchRelatedFields(open, form.getFieldValue('module'), form.getFieldValue('api_name'))
                    }
                  }}
                >
                  {relatedFields.map(item => (
                    <Option key={item.api_name} value={item.api_name}>
                      {item.field_value}
                    </Option>
                  ))}
                </Select>
              {/* </ConfigProvider> */}
            </Form.Item>
            <Form.Item
              name="required"
              valuePropName="checked"
            >
              <Checkbox>Obrigatório</Checkbox>
            </Form.Item>
            <Form.Item
              name="disabled"
              valuePropName="checked"
            >
              <Checkbox>Desabilitar</Checkbox>
            </Form.Item>
          </Form>
        )}
        {form.getFieldValue('field_type') === 'select' && (
          <Form
            form={form}
            // initialValues={{  }}
            layout="vertical"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOk();
              }
            }}>
            <Form.Item
              name="label"
              label="Nome do campo"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <Input ref={inputRef} />
            </Form.Item>
            <Text>Opções</Text>

            <Layout
              style={{
                background: colorBgContainer,
                borderRadius: borderRadiusSM,
                border: '1px solid #ccc',
                height: "250px",
                overflowY: 'auto',
                marginTop: '10px',
                marginBottom: '15px',
                padding: '10px'
              }}
            >
              <Form.List
                name="options"
              // rules={[
              //   {
              //     validator: async (_, options) => {
              //       if (!options || options.length < 2) {
              //         return Promise.reject(new Error('At least 2 options'));
              //       }
              //     },
              //   },
              // ]}
              >
                {(fields, { add, remove }, { move }) => (
                  <>
                    {fields.map((field, index) => {
                      console.log("field",field)
                      console.log("index",index)
                      
                      return (
                      <Form.Item
                        {...(formItemLayout)}
                        label={''}
                        required={false}
                        key={field.key}
                      >
                        <Space align="baseline">
                          <Form.Item
                            {...field}
                            validateTrigger={['onChange', 'onBlur']}
                            rules={[
                              {
                                required: true,
                                whitespace: false,
                                message: "Insira uma opção.",
                              },
                            ]}
                            noStyle
                            span={24}
                          >
                            <Input
                              placeholder="Opção"
                              style={{ width: '395px' }}
                            />
                          </Form.Item>
                          <PlusCircleOutlined
                            onClick={() => add('', index + 1)}
                          />
                          {fields.length > 1 && (
                            <MinusCircleOutlined
                              className="dynamic-delete-button"
                              onClick={() => remove(field.name)}
                            />
                          )}
                        </Space>
                      </Form.Item>
                    )})}
                    {/* <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          style={{ width: '60%' }}
                          icon={<PlusOutlined />}
                        >
                          Adicionar opção
                        </Button>
                      </Form.Item> */}
                  </>
                )}
              </Form.List>
            </Layout>
            <Form.Item
              name="required"
              valuePropName="checked"
            >
              <Checkbox>Obrigatório</Checkbox>
            </Form.Item>
            <Form.Item
              name="disabled"
              valuePropName="checked"
            >
              <Checkbox>Desabilitar</Checkbox>
            </Form.Item>
          </Form>
        )}
        {form.getFieldValue('field_type') === 'date' && (
          <Form
            form={form}
            layout="vertical"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOk();
              }
            }}>
            <Form.Item
              name="label"
              label="Nome do campo"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <Input ref={inputRef} />
            </Form.Item>
            <Form.Item
              name="required"
              valuePropName="checked"
            >
              <Checkbox>Obrigatório</Checkbox>
            </Form.Item>
            <Form.Item
              name="disabled"
              valuePropName="checked"
            >
              <Checkbox>Desabilitar</Checkbox>
            </Form.Item>
          </Form>
        )}
        {form.getFieldValue('field_type') === 'date_time' && (
          <Form
            form={form}
            layout="vertical"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOk();
              }
            }}>
            <Form.Item
              name="label"
              label="Nome do campo"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <Input ref={inputRef} />
            </Form.Item>
            <Form.Item
              name="required"
              valuePropName="checked"
            >
              <Checkbox>Obrigatório</Checkbox>
            </Form.Item>
            <Form.Item
              name="disabled"
              valuePropName="checked"
            >
              <Checkbox>Desabilitar</Checkbox>
            </Form.Item>
          </Form>
        )}
        {form.getFieldValue('field_type') === 'email' && (
          <Form
            form={form}
            layout="vertical"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOk();
              }
            }}>
            <Form.Item
              name="label"
              label="Nome do campo"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <Input ref={inputRef} />
            </Form.Item>
            <Form.Item
              name="char"
              label="Número de caracteres permitidos (Máximo 255)"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <InputNumber changeOnWheel max={255} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="required"
              valuePropName="checked"
            >
              <Checkbox>Obrigatório</Checkbox>
            </Form.Item>
            <Form.Item
              name="disabled"
              valuePropName="checked"
            >
              <Checkbox>Desabilitar</Checkbox>
            </Form.Item>
          </Form>
        )}
        {form.getFieldValue('field_type') === 'phone' && (
          <Form
            form={form}
            layout="vertical"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOk();
              }
            }}>
            <Form.Item
              name="label"
              label="Nome do campo"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <Input ref={inputRef} />
            </Form.Item>
            <Form.Item
              name="char"
              label="Número de caracteres permitidos (Máximo 255)"
              rules={[{ required: true, message: 'Insira um valor!' }]}
            >
              <InputNumber changeOnWheel max={255} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="required"
              valuePropName="checked"
            >
              <Checkbox>Obrigatório</Checkbox>
            </Form.Item>
            <Form.Item
              name="disabled"
              valuePropName="checked"
            >
              <Checkbox>Desabilitar</Checkbox>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Layout>
  );
};

export default DragAndDrop;
