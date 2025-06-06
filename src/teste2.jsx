



const TextoFormatado = () => {
  const fileName = "Segue PDF com maiores informações sobre: Gestão Agricola \n\nA ABIGS agradece o seu contato, tenha um ótimo evento!";

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
//   export default TextoFormatado;
