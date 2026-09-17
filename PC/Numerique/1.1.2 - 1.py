import numpy as np
import matplotlib.pyplot as plt

H0=1
G0=np.abs(H0)

# Tracé du diagramme de Bode du filtre d'ordre 1

def G1(f,fc):
    return G0/(1+(f/fc)**2)**0.5

def Phi1(f,fc):
    return -np.arctan(f/fc) if H0>0 else np.pi-np.arctan(f/fc)

def GdB(f,fc): # Fonction gain en dB
    return 20*np.log10(G1(f,fc))

fmin=0.0
fmax=10**6
points=10**5

f=np.linspace(fmin,fmax,points) #

# TRACE DE LA COURBE DE GAIN

fc=1000 # Fixe la valeur de fc en Hz


fig,ax=plt.subplots()
ax.grid(which='minor')

plt.plot(f,GdB(f,fc),c='r',label=r'$G_{dB}$')
plt.xlabel(r'$f$')
plt.ylabel(r'$G_{dB}(f)$ en dB')
plt.xscale('log') # Echelle logarithmique sur les fréquences
plt.legend()
plt.xlim(1,10**5) # Domaine de variation de la fréquence
plt.ylim(-40,5)
plt.grid(True)


fig,ax=plt.subplots()
ax.grid(which='minor')

plt.plot(f,Phi1(f,fc),c='b',label=r'Phi')
plt.xlabel(r'$f$')
plt.ylabel(r'Phi(f) en rad')
plt.xscale('log') # Echelle logarithmique sur les fréquences
plt.legend()
plt.xlim(1,10**5) # Domaine de variation de la fréquence
plt.ylim(-np.pi,np.pi)
plt.grid(True) 

plt.show()




fe = 1e3  # fréquence du signal d’entrée en Hz
E = 1.  # amplitude du signal créneau
moyenne = 1.  # moyenne du signal créneau

nmax=1000 # Nombre d'harmoniques prises en compte

# Synthèse spectrale du signal d'entrée - Tracé de e(t)

cn=[] # Définit la liste des coefficients de Fourier
phin=[] # phases

for i in range(nmax):
    cn.append(4*E/((2*i+1)*np.pi))  # Amplitudes des différentes harmoniques
    phin.append(-np.pi/2)  # A compléter

# Tracé de la fonction e(t) à partir de la DSF - Représentation temporelle -

def e(t):
    val=moyenne # Valeur moyenne
    for n in range(0,len(cn)):
        #val+=cn[n]*np.cos(2*np.pi*n*fe*t+phin[n])
        val+=cn[n]*np.cos(2*np.pi*(2*n+1)*fe*t+phin[n])
    return val

fc=0.1*fe # Choix de la fréquence de coupure

def s(t,fc): # Définit la fonction s
    val=G1(0, fc) * moyenne
    for n in range(0,len(cn)):
        an=G1((2*n+1)*fe,fc)*cn[n]
        psin=phin[n]+Phi1((2*n+1)*fe,fc)
        val+=an*np.cos(2*np.pi*(2*n+1)*fe*t+psin)
    return val

t = np.linspace(0, 3/fe, 1000)

plt.plot(t,e(t),'b-',label=r'$e(t)$')
plt.plot(t,s(t,fc),linestyle='dashed',c='r',label=r'$s(t)$')
plt.xlim(0,3/fe),plt.xlabel(r"$t$ (en s)")
plt.ylim(-0.5,2.5)
plt.legend()
plt.grid()
plt.show()