function ChangeUnits() {
    const FT2METERS = 0.3048;                   // mult. ft. to get meters (exact)
    var si = document.getElementById("unitsSi").checked;
    
    var oldAltField = document.getElementById("altfield").value;  
  //  alert("oldAltField "+oldAltField);
    var alt = Number(oldAltField);
  //  alert("alt "+ alt.toPrecision(4));
    if (si)
      alt = alt*FT2METERS;
    else  
      alt = alt/FT2METERS;
      
  //  alert("alt "+ alt.toPrecision(4));    
  
    var newAltField = alt.toFixed();  
  //  alert("newAltField "+newAltField);
      
    document.getElementById("altfield").value = newAltField;
    if (si)
      document.getElementById("altunits").value = "meters";
    else
      document.getElementById("altunits").value = "feet";
  
    ComputeAtmosphere();
      
  }   // --------------------------------------------- End of function ChangeUnits
  
  function HideResults() {
  //  alert("Hiding results");
    document.getElementById("results").style.visibility="hidden";
  }   // --------------------------------------------- End of function HideResults
  
  function GetAtmosBand(htab,h) {
    const TABLESIZE = 8;
  //  const htab = [0.0, 11.0, 20.0, 32.0, 47.0, 51.0, 71.0, 84.852];
    var i,j,k;
  
    i=0;
    j=TABLESIZE-1;
    while (true) {                               // binary search in ordered table 
      k = Math.floor((i+j) / 2);             // integer division. OK since i+j > 0
      if (h < htab[k])  j=k; else i=k;
      if (j <= i+1) break;
    }  
  //  alert("i " + i.toFixed() );
    return i;
  }   // -------------------------------------------- End of function GetAtmosBand
  
  
  
  function ComputeAtmosphere() {
    const TABLESIZE = 8;
    const REARTH = 6369.0;         // polar radius of the Earth (km)
    const GMR = 34.163195;         // hydrostatic constant 
  
    const TZERO      = 288.15;                 // temperature at sealevel, kelvins
    const PZERO      = 101325.0;             // pressure at sealevel, N/sq.m. = Pa
    const RHOZERO    = 1.2250;                    // density at sealevel, kg/cu.m.
    const ASOUNDZERO = 340.294;               // speed of sound at sealevel, m/sec
  
    const FT2METERS = 0.3048;                   // mult. ft. to get meters (exact)
    const KELVIN2RANKINE = 1.8;                         // mult deg K to get deg R
    const PSF2NSM = 47.880258;                      // mult lb/sq.ft to get N/sq.m
    const SCF2KCM = 515.379;                    // mult slugs/cu.ft to get kg/cu.m
    const FT2KM = 0.0003048;                                // mult feet to get km
    
    const htab = [0.0, 11.0, 20.0, 32.0, 47.0, 51.0, 71.0, 84.852];
    const ttab = [288.15, 216.65, 216.65, 228.65, 270.65,
                         270.65, 214.65, 186.87 ];
    const ptab = [1.0, 2.2336110E-1, 5.4032950E-2, 8.5666784E-3,
                       1.0945601E-3, 6.6063531E-4, 3.9046834E-5, 3.685010E-6];
    const gtab = [-6.5, 0.0, 1.0, 2.8, 0.0, -2.8, -2.0, 0.0];
  
    var gamma = 1.4;
    var i;
    var h, tgrad, deltah, tbase, tlocal;
  
    var sigma,delta,theta;
    var xx,zz   // temporary buffers
  //  alert("Units");
  
    var si = document.getElementById("unitsSi").checked;          // si is boolean
  //  alert("Units " + si);
    var altfield = document.getElementById("altfield").value;
  //  alert("altitude " + altfield);
  
  
    var alt = Number(altfield);                        // convert string to double
    if (isNaN(alt)) {alert("Altitude is not a number."); return; }
  // if si is true, alt is in meters; if si is false, alt is in feet
  
  
    var altkm;
    if (si) altkm=alt/1000; else altkm=FT2KM*alt;
     // Convert geometric to geopotential altitude (kilometers)
    h=altkm*REARTH/(altkm+REARTH); 
  
    if (altkm > 86) alert("Algorithm only correct to 86 km (282152 ft). "+
                          "Only approximate above that altitude."); 
  
  
  //  alert("alt and mach " + alt.toPrecision(4) + " " + mach.toPrecision(4)
  //    + " " + altkm.toPrecision(4) + " " + h.toPrecision(4) );
      
    var iband = GetAtmosBand(htab,h);  
  //  alert("atmos band " + iband.toFixed() );
    tgrad=gtab[iband];
  //  alert("tgrad " + tgrad.toPrecision(4) );
    deltah=h-htab[iband];
    tbase=ttab[iband];
  //  alert("tgrad,deltah,tbase " + tgrad.toPrecision(4) + " " +
  //     deltah.toPrecision(4) + " " + tbase.toPrecision(4) );
  
    tlocal=tbase+tgrad*deltah;
    theta=tlocal/ttab[0];                                // temperature ratio 
    delta=1.0;
    if (tgrad==0.0)                                         // pressure ratio 
      delta=ptab[iband]*Math.exp(-GMR*deltah/tbase);
    else
      delta=ptab[iband]*Math.exp(Math.log(tbase/tlocal)*GMR/tgrad);
    
    sigma=delta/theta;
  
    document.getElementById("thetafield").value = theta.toPrecision(5);
    document.getElementById("deltafield").value = delta.toExponential(5);
    document.getElementById("sigmafield").value = sigma.toExponential(5);
  
  //alert("qqqq");
    xx = TZERO*theta;
    if (!si) xx = xx*KELVIN2RANKINE;
    zz = xx.toPrecision(5);
    if (si) zz = zz + " K"; else zz = zz + " deg R";
    document.getElementById("tempfield").value = zz;
  
    xx = PZERO*delta;
    if (!si) xx = xx/PSF2NSM;
    zz = xx.toPrecision(5);
    if (si) zz = zz + " Pascals"; else zz = zz + " lbs/sq.ft.";
    document.getElementById("pressfield").value = zz;
    
    xx = RHOZERO*sigma;
    if (!si) xx = xx/SCF2KCM;
    zz = xx.toExponential(5);
    if (si) zz = zz + " kg/m^3"; else zz = zz + " slugs/ft^3";
    document.getElementById("denfield").value = zz;
  
    xx=ASOUNDZERO*Math.sqrt(theta);   // speed of sound 
    if (!si) xx=xx/FT2METERS;
    zz = xx.toPrecision(6);
    if (si) zz = zz + " m/s"; else zz = zz + " ft/s";
    document.getElementById("asoundfield").value = zz;
  
    
  
    document.getElementById("results").style.visibility="visible";
  
  }  // -------------------------------------------- End function ComputeAtmosphere