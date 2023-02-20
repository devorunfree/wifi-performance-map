import React from "react";

const Checkbox = ({id, label, checked, onChange, checkedImage, uncheckedImage, ...props }) => {
  let checkboxImage;

  if (checked) {
    checkboxImage = <img src={checkedImage} alt="Checked" style={{width: '40px', height: '40px', padding: '5px'}} />;
  } else {
    checkboxImage = <img src={uncheckedImage} alt="Unchecked" style={{width: '40px', height: '40px', padding: '5px'}} />;
  }

  return (
    <div className="checkbox-wrapper">
      <input type="checkbox" id={id} checked={checked}
        onChange={() => onChange(id)} 
        {...props}
        style={{display: "none"}}
      />
<label htmlFor={id} style={{display: 'flex', alignItems: 'center', padding: '5px', width: '40px', height: '40px'}}>
  {checkboxImage}
  {label}
</label>

    </div>
  );
};


export default Checkbox;
