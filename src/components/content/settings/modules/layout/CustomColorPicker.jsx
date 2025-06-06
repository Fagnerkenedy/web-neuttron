import React from 'react';
import {
  ColorPicker,
  Divider,
  Row,
  Col,
  Space,
  theme,
} from 'antd';
import {
  red,
  green,
  cyan,
  volcano,
  generate,
  presetPalettes,
} from '@ant-design/colors';

function genPresets(presets = presetPalettes) {
  return Object.entries(presets).map(([label, colors]) => ({
    label,
    colors,
    key: label,
  }));
}

const CustomColorPicker = ({ value, onChange }) => {
  const { token } = theme.useToken();

  const presets = genPresets({
    primary: generate(token.colorPrimary),
    red,
    green,
    cyan,
    volcano,
  });

  const customPanelRender = (_, { components: { Picker, Presets } }) => (
    <Row justify="space-between" wrap={false}>
      <Col span={12}>
        <Presets />
      </Col>
      <Divider type="vertical" style={{ height: 'auto' }} />
      <Col flex="auto">
        <Picker />
      </Col>
    </Row>
  );

  return (
    <ColorPicker
      value={typeof value === 'string' ? value : undefined}
      onChange={(color) => {
        const hex = color?.toHexString?.();
        onChange?.(hex || undefined); // só chama se onChange existir
      }}
      allowClear
      panelRender={customPanelRender}
      presets={presets}
      styles={{ popupOverlayInner: { width: 480 } }}
    />
  );
};

export default CustomColorPicker;
