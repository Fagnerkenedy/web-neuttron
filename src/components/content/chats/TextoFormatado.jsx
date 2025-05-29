const TextoFormatado = ({ fileName }) => {
    if (!fileName) return null;
    
    return (
      <div>
        {fileName.split("\n").map((linha, index) => (
          <span key={index}>
            {linha}
            <br />
          </span>
        ))}
      </div>
    );
  };
  
  export default TextoFormatado;
  