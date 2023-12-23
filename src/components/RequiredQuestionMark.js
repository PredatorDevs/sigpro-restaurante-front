import { InfoCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

export const RequiredQuestionMark = () => (
  <Tooltip title="Dato requerido">
    <InfoCircleOutlined style={{ color: 'gray' }} />
  </Tooltip>
);
