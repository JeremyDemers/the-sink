import React from 'react';

interface Props {
  readonly description: string;
}

const Note: React.FC<Props> = ({ description }) => {
  return (
    <div className="info-block">
      <i className="font-icon-info icon-s" />
      <p>
        {description}
      </p>
    </div>
  );
};

export default Note;
